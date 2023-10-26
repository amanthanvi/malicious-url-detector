# Malicious URL Detector

Malicious URL Detector is a web application designed to identify potentially dangerous or malicious URLs using multiple services for a comprehensive safety profile. This tool integrates with external APIs, including VirusTotal and [this Hugging Face API](https://huggingface.co/elftsdmr/malware-url-detect), to provide a robust analysis of URLs.

## Features

- **URL Validation**: Ensures that the input is a properly structured URL.
- **VirusTotal Integration**: Checks the URL against VirusTotal's database and analysis.
- **Hugging Face Integration**: Uses machine learning (provided by a model on Hugging Face) to predict the likelihood of a URL being malicious.
- **Comprehensive Results**: Provides detailed results, including the response from external services and overall safety rating.
- **User-Friendly Interface**: Easy-to-use web interface for inputting URLs and receiving feedback.

You can either use the web-app version [here](https://athanvi.pythonanywhere.com/) or run it locally (Note: if you run it locally, you will have to get your own API keys for VirusTotal and HuggingFace).

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of Python.
- You have a basic understanding of Python programming.
- You have read the documentation of the APIs used in this project.

## Installation

To install Malicious URL Detector, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/your-username/malicious-url-detector.git
```

2. Navigate to the project directory and install the dependencies:

```bash
cd malicious-url-detector
pip install -r requirements.txt
```

## Usage

To use Malicious URL Detector, follow these steps:

1. Start the server:

```bash
python app.py
```

2. Open a web browser and navigate to:

```
http://localhost:5000
```

3. Enter a URL you want to check for potential security threats.

## Contributing

Any contributions are are greatly appreciated!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Add some feature-name'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Aman Thanvi - contact@amanthanvi.com | aman_thanvi@outlook.com

Project Link: [https://github.com/amanthanvi/malicious-url-detector](https://github.com/amanthanvi/malicious-url-detector)
