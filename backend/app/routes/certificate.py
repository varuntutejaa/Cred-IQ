import io
import base64
import PyPDF2
from flask import Blueprint, request, jsonify
from urllib.parse import urlparse
from ..firebase_admin_init import firebase_required

certificate_bp = Blueprint('certificate', __name__)

# Known legitimate issuers and their verification domains
KNOWN_ISSUERS = {
    'amazon web services': {'domains': ['aws.amazon.com', 'verify.aws.training', 'aws.training'],          'reputation': 95, 'category': 'Cloud'},
    'aws':                 {'domains': ['aws.amazon.com', 'verify.aws.training', 'aws.training'],          'reputation': 95, 'category': 'Cloud'},
    'google':              {'domains': ['credential.net', 'google.com', 'coursera.org', 'grow.google'],    'reputation': 92, 'category': 'Technology'},
    'microsoft':           {'domains': ['microsoft.com', 'learn.microsoft.com', 'credly.com'],             'reputation': 93, 'category': 'Technology'},
    'meta':                {'domains': ['coursera.org', 'edx.org'],                                        'reputation': 88, 'category': 'Technology'},
    'cisco':               {'domains': ['cisco.com', 'credly.com'],                                        'reputation': 92, 'category': 'Networking'},
    'coursera':            {'domains': ['coursera.org', 'coursera-certificate.net'],                       'reputation': 82, 'category': 'Education'},
    'udemy':               {'domains': ['udemy.com', 'ude.my'],                                            'reputation': 68, 'category': 'Education'},
    'edx':                 {'domains': ['edx.org', 'credentials.edx.org'],                                 'reputation': 83, 'category': 'Education'},
    'hackerrank':          {'domains': ['hackerrank.com'],                                                  'reputation': 78, 'category': 'Programming'},
    'mongodb':             {'domains': ['mongodb.com', 'university.mongodb.com'],                          'reputation': 85, 'category': 'Database'},
    'docker':              {'domains': ['docker.com', 'dckr.pt'],                                          'reputation': 87, 'category': 'DevOps'},
    'kubernetes':          {'domains': ['kubernetes.io', 'cncf.io', 'training.linuxfoundation.org'],       'reputation': 90, 'category': 'DevOps'},
    'linux foundation':    {'domains': ['linuxfoundation.org', 'cncf.io', 'training.linuxfoundation.org'], 'reputation': 90, 'category': 'Open Source'},
    'comptia':             {'domains': ['comptia.org', 'verify.comptia.org', 'ce.comptia.org'],            'reputation': 88, 'category': 'IT Security'},
    'red hat':             {'domains': ['redhat.com', 'rhtapps.io'],                                       'reputation': 90, 'category': 'Linux / Open Source'},
    'salesforce':          {'domains': ['salesforce.com', 'trailhead.salesforce.com'],                     'reputation': 85, 'category': 'CRM / Cloud'},
    'databricks':          {'domains': ['databricks.com', 'credentials.databricks.com'],                   'reputation': 86, 'category': 'Data Engineering'},
    'hashicorp':           {'domains': ['hashicorp.com', 'credly.com'],                                    'reputation': 85, 'category': 'DevOps / IaC'},
    'ibm':                 {'domains': ['ibm.com', 'credly.com'],                                          'reputation': 87, 'category': 'Technology'},
    'oracle':              {'domains': ['oracle.com', 'brm.oracle.com', 'catalog.us.oracle.com'],          'reputation': 86, 'category': 'Database'},
    'pmi':                 {'domains': ['pmi.org', 'ccrs.pmi.org'],                                        'reputation': 88, 'category': 'Project Management'},
    'github':              {'domains': ['github.com', 'credly.com'],                                       'reputation': 83, 'category': 'Development'},
    'linkedin':            {'domains': ['linkedin.com', 'lnkd.in'],                                        'reputation': 72, 'category': 'Education'},
    'freecodecamp':        {'domains': ['freecodecamp.org'],                                                'reputation': 73, 'category': 'Programming'},
    'codecademy':          {'domains': ['codecademy.com'],                                                  'reputation': 71, 'category': 'Programming'},
    'pluralsight':         {'domains': ['pluralsight.com', 'app.pluralsight.com'],                         'reputation': 78, 'category': 'Technology'},
    'datacamp':            {'domains': ['datacamp.com'],                                                    'reputation': 75, 'category': 'Data Science'},
    'snowflake':           {'domains': ['snowflake.com', 'achieve.snowflake.com'],                         'reputation': 83, 'category': 'Data Engineering'},
    'tableau':             {'domains': ['tableau.com'],                                                     'reputation': 80, 'category': 'Data Visualization'},
    'deeplearning.ai':     {'domains': ['deeplearning.ai', 'coursera.org'],                                 'reputation': 88, 'category': 'Machine Learning'},
    'deeplearning':        {'domains': ['deeplearning.ai', 'coursera.org'],                                 'reputation': 88, 'category': 'Machine Learning'},
    'credly':              {'domains': ['credly.com', 'badgr.com'],                                        'reputation': 80, 'category': 'Certifications'},
    'cloudflare':          {'domains': ['cloudflare.com', 'cloudflare.training'],                          'reputation': 84, 'category': 'Cloud / Security'},
}


def _get_domain(url: str):
    try:
        parsed = urlparse(url.strip())
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain or None
    except Exception:
        return None


def _match_issuer(issuer: str):
    key = issuer.strip().lower()
    if key in KNOWN_ISSUERS:
        return KNOWN_ISSUERS[key]
    for k, v in KNOWN_ISSUERS.items():
        if k in key or key in k:
            return v
    return None


def _check_url(url: str, issuer_info: dict):
    if not url:
        return 'no_url', 'No verification URL provided', 0

    domain = _get_domain(url)
    if not domain:
        return 'bad_url', 'URL could not be parsed', -20

    if issuer_info:
        known = issuer_info.get('domains', [])
        if any(domain == d or domain.endswith('.' + d) for d in known):
            return 'match', f'Domain "{domain}" matches verified issuer database', 15
        elif known:
            return 'mismatch', f'Domain "{domain}" does NOT match expected domains for this issuer ({", ".join(known[:2])})', -35

    return 'unknown_issuer', f'Issuer not in database — URL domain: {domain}', 0


def _build_result(name: str, issuer: str, date: str, url: str, extracted: dict = None) -> dict:
    """Shared pipeline: issuer check + trust score + AI skill analysis."""
    issuer_info = _match_issuer(issuer) if issuer else None
    url_status, url_reason, url_delta = _check_url(url, issuer_info)

    base  = issuer_info['reputation'] if issuer_info else 50
    trust = max(5, min(100, base + url_delta))

    if url_status == 'match' and trust >= 70:
        status = 'verified'
    elif url_status in ('mismatch', 'bad_url'):
        status = 'suspicious'
        trust  = max(5, trust - 25)
    else:
        status = 'review'

    try:
        from ..services.gemini_service import analyze_certificate_skills
        ai = analyze_certificate_skills(name, issuer, date)
    except Exception as exc:
        ai = {
            'skills_learned':       [],
            'skill_analysis':       f'AI unavailable: {str(exc)[:120]}',
            'career_insights':      '',
            'industry_value':       'unknown',
            'difficulty_level':     'unknown',
            'complementary_skills': [],
            'job_roles':            [],
            'real_world_applications': [],
        }

    result = {
        'name':        name,
        'issuer':      issuer or 'Unknown',
        'date':        date,
        'url':         url,
        'status':      status,
        'trust_score': trust,
        'verification': {
            'url_status':        url_status,
            'reason':            url_reason,
            'issuer_known':      bool(issuer_info),
            'issuer_category':   issuer_info['category']   if issuer_info else 'Unknown',
            'issuer_reputation': issuer_info['reputation'] if issuer_info else 50,
        },
        'ai': ai,
    }
    if extracted:
        result['extracted'] = extracted  # pass back AI-extracted fields for UI display
    return result


def _extract_from_image(file_bytes: bytes, mime_type: str) -> dict:
    """Use Groq vision model to read certificate details from an image."""
    from ..services.gemini_service import _get_client, _parse_json
    client = _get_client()
    b64    = base64.b64encode(file_bytes).decode('utf-8')
    resp   = client.chat.completions.create(
        model='meta-llama/llama-4-scout-17b-16e-instruct',
        messages=[{
            'role': 'user',
            'content': [
                {'type': 'image_url', 'image_url': {'url': f'data:{mime_type};base64,{b64}'}},
                {'type': 'text', 'text': (
                    'This is a certificate image. Extract all visible details and return ONLY JSON, no markdown:\n'
                    '{"name":"<certificate or course name>","issuer":"<issuing organization>",'
                    '"date":"<date issued>","recipient":"<person name if visible>",'
                    '"url":"<verification URL if visible or empty string>",'
                    '"credential_id":"<credential/certificate ID if visible or empty string>"}'
                )},
            ],
        }],
        max_tokens=512,
    )
    raw = resp.choices[0].message.content.strip()
    return _parse_json(raw)


def _extract_from_pdf(file_bytes: bytes) -> dict:
    """Extract text from PDF then use Groq to parse certificate details."""
    from ..services.gemini_service import _get_client, _parse_json, _generate
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text   = '\n'.join((page.extract_text() or '') for page in reader.pages)
    text   = text[:4000]  # cap to avoid token overflow

    if not text.strip():
        raise ValueError('PDF appears to be a scanned image — no extractable text found')

    prompt = (
        'The following is text extracted from a certificate PDF. '
        'Parse it and return ONLY JSON, no markdown:\n'
        '{"name":"<certificate or course name>","issuer":"<issuing organization>",'
        '"date":"<date issued>","recipient":"<person name>",'
        '"url":"<verification URL if present or empty string>",'
        '"credential_id":"<credential ID if present or empty string>"}\n\n'
        f'PDF TEXT:\n{text}'
    )
    raw = _generate(prompt)
    return _parse_json(raw)


@certificate_bp.post('/upload')
@firebase_required
def upload_certificate(firebase_uid, firebase_claims):
    """Accept an image or PDF, extract details with AI, then run full analysis."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    f         = request.files['file']
    filename  = (f.filename or '').lower()
    mime_type = f.content_type or ''

    if not filename:
        return jsonify({'error': 'Empty filename'}), 400

    file_bytes = f.read()
    if len(file_bytes) > 15 * 1024 * 1024:
        return jsonify({'error': 'File too large — max 15 MB'}), 413

    is_pdf   = filename.endswith('.pdf') or 'pdf' in mime_type
    is_image = any(filename.endswith(ext) for ext in ('.png', '.jpg', '.jpeg', '.webp')) or 'image' in mime_type

    if not is_pdf and not is_image:
        return jsonify({'error': 'Only PDF and image files (PNG, JPG, JPEG, WEBP) are supported'}), 415

    try:
        if is_pdf:
            extracted = _extract_from_pdf(file_bytes)
        else:
            img_mime  = mime_type if 'image/' in mime_type else f'image/{"png" if filename.endswith(".png") else "jpeg"}'
            extracted = _extract_from_image(file_bytes, img_mime)
    except Exception as exc:
        return jsonify({'error': f'Could not read certificate: {str(exc)[:200]}'}), 422

    name   = str(extracted.get('name',   '') or '').strip()
    issuer = str(extracted.get('issuer', '') or '').strip()
    date   = str(extracted.get('date',   '') or '').strip()
    url    = str(extracted.get('url',    '') or '').strip()

    if not name:
        return jsonify({'error': 'Could not extract certificate name — try entering details manually'}), 422

    return jsonify(_build_result(name, issuer, date, url, extracted=extracted))


@certificate_bp.post('/analyze')
@firebase_required
def analyze_certificate(firebase_uid, firebase_claims):
    body   = request.get_json(silent=True) or {}
    name   = (body.get('name')   or '').strip()
    issuer = (body.get('issuer') or '').strip()
    date   = (body.get('date')   or '').strip()
    url    = (body.get('url')    or '').strip()

    if not name:
        return jsonify({'error': 'Certificate name is required'}), 400

    return jsonify(_build_result(name, issuer, date, url))
