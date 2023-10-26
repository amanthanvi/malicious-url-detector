import os, re, requests
from flask import Flask, render_template, request, redirect, url_for, session
from dotenv import load_dotenv
import time

app = Flask(__name__)
# Load environment variables from .env file
load_dotenv()
app.secret_key = os.urandom(24)

# Hugging Face API setup
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/elftsdmr/malware-url-detect"
huggingface_api_key = os.environ.get('HUGGINGFACE_API_KEY')
headers = {
    "Authorization": f"Bearer {huggingface_api_key}"
}

# VirusTotal API setup
VIRUSTOTAL_API_KEY = os.getenv('VIRUSTOTAL_API_KEY')
VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls'


def validate_url(url):
    """
    Validates if the input string is a URL or a domain-like string.
    """
    regex = re.compile(
        r'^(?:https?:\/\/)?'  # http:// or https://
        r'(?:www\.)?'  # www.
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    return re.match(regex, url) is not None

def add_http_scheme(url):
    # Check if the URL starts with 'http://' or 'https://'
    if not re.match(r'^https?:\/\/', url):
        # If not, append 'https://' to the start of the URL
        url = f'https://{url}'
    return url

def check_virustotal(url):
    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }
    response = requests.post(VIRUSTOTAL_API_URL, headers=headers, data={'url': url})
    if response.status_code == 200:
        analysis_id = response.json().get('data', {}).get('id')
        analysis_results = get_virustotal_analysis_results(analysis_id)
        return analysis_results
    else:
        print(f"Error submitting URL to VirusTotal: {response.status_code}")
        return None


def get_virustotal_analysis_results(analysis_id):
    analysis_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"
    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    for _ in range(10):  # Retry 10 times
        response = requests.get(analysis_url, headers=headers)
        if response.status_code == 200:
            attributes = response.json().get('data', {}).get('attributes', {})
            stats = attributes.get('stats', {})
            malicious = stats.get('malicious', 0)
            return malicious > 0  # URL is malicious if at least one detection
        time.sleep(15)  # Wait for 15 seconds before the next poll
    return None  # Analysis did not complete in time

def get_virustotal_detailed_results(url):
    """
    Fetch detailed results from VirusTotal for a specific URL.

    :param url: str, the URL to check.
    :return: dict, detailed results.
    """
    # Submit the URL to VirusTotal for analysis first, if you haven't done so already.
    # This part of the code is similar to what you have in check_virustotal(url).

    headers = {"x-apikey": VIRUSTOTAL_API_KEY}
    response = requests.post(VIRUSTOTAL_API_URL, headers=headers, data={'url': url})

    if response.status_code != 200:
        print(f"Error submitting URL to VirusTotal: {response.status_code}")
        return None

    # Retrieve the analysis_id from the submission response
    analysis_id = response.json().get('data', {}).get('id')

    # Now, we fetch the detailed report.
    analysis_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"

    response = requests.get(analysis_url, headers=headers)

    if response.status_code == 200:
        report = response.json()
        # The structure of 'report' depends on the VirusTotal API's response.
        # You will need to adapt the following lines based on that structure.

        detailed_results = {
            'positive_detections': report.get('data', {}).get('attributes', {}).get('stats', {}).get('malicious', 0),
            'total_engines': report.get('data', {}).get('attributes', {}).get('stats', {}).get('harmless', 0) + report.get('data', {}).get('attributes', {}).get('stats', {}).get('malicious', 0),
            # ... other details you want to include.
        }
        return detailed_results

    else:
        print(f"Error retrieving detailed report from VirusTotal: {response.status_code}")
        return None

def get_huggingface_detailed_results(url):
    """
    Fetch detailed results from Hugging Face for a specific URL.

    :param url: str, the URL to check.
    :return: dict, detailed results.
    """
    response = requests.post(HUGGINGFACE_API_URL, headers=headers, json={"inputs": url})

    if response.status_code == 200:
        data = response.json()

        # Parse the data to extract detailed information
        # The structure of `detailed_results` depends on how Hugging Face's response is structured.
        detailed_results = {
            'score': data[0][0]['score'],  # Confidence score of the prediction
            'label': data[0][0]['label'],  # Predicted label
            # Any additional information you might want
        }

        return detailed_results
    else:
        print(f"Error retrieving detailed results from Hugging Face: {response.status_code}")
        return None  # or handle this appropriately based on your application's logic


def is_url_malicious_with_huggingface(url):
    response = requests.post(HUGGINGFACE_API_URL, headers=headers, json={"inputs": url})
    if response.status_code != 200:
        print(f"Error from Hugging Face API: {response.status_code}")
        return None

    predictions = response.json()

    if not isinstance(predictions, list) or not predictions:
        print("Unexpected response structure from Hugging Face.")
        return None

    first_result = predictions[0]

    if not isinstance(first_result, list) or not first_result:
        print("Unexpected result structure in Hugging Face response.")
        return None

    max_score_prediction = max(first_result, key=lambda x: x.get('score', 0))
    return max_score_prediction.get('label', '').lower() == 'malware'

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        url_to_check = request.form['url']
        is_valid = validate_url(url_to_check)

        if not is_valid:
            session['message'] = "The provided URL is invalid. Please enter a valid URL."
            session['alert_class'] = "alert-secondary"
            return redirect(url_for('home'))

        # Proceed with checks if the URL is valid
        is_malicious_vt = check_virustotal(url_to_check)
        is_malicious_hf = is_url_malicious_with_huggingface(url_to_check)

        # If either check determines the URL is malicious, consider it maybe malicious
        if is_malicious_vt or is_malicious_hf:
            # If either check determines the URL is potentially malicious, we set a cautious message
            session['message'] = "Potential detection, review detailed results."
            session['alert_class'] = "alert-warning"  # a warning class, or whichever you prefer
        # If both checks determine the URL malicious, consider it malicious
        elif is_malicious_vt and is_malicious_hf:
            session['message'] = "The URL is malicious."
            session['alert_class'] = "alert-danger"
        else:
            session['message'] = "The URL is safe."
            session['alert_class'] = "alert-success"

        session['detailed_results'] = {
            'virustotal': get_virustotal_detailed_results(url_to_check),
            'huggingface': get_huggingface_detailed_results(url_to_check)
        }

        return redirect(url_for('home'))  # Redirect to the same route

    # Retrieve results from the session if available and then clear the session
    message = session.pop('message', "")
    alert_class = session.pop('alert_class', "alert-secondary")  # default for no results
    detailed_results = session.pop('detailed_results', {})

    return render_template('index.html', message=message, alert_class=alert_class, detailed_results=detailed_results)

if __name__ == '__main__':
    app.run(debug=True)