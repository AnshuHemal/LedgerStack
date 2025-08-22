from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import json
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Keys and URLs (you can move these to environment variables)
GST_API_KEY = "36291eeb6c9ff0f2ce9588c9dcd71521"
GST_API_BASE_URL = "https://sheet.gstincheck.co.in/check"
IFSC_API_BASE_URL = "https://ifsc.razorpay.com"

class DataFetcher:
    """Class to handle GST and IFSC data fetching"""
    
    @staticmethod
    def validate_gstin(gstin):
        """Validate GSTIN format"""
        if not gstin or len(gstin) != 15:
            return False, "GSTIN must be 15 characters long"
        
        # GSTIN format: 2 digits state code + 10 digits PAN + 1 digit entity + 1 digit check sum
        pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
        if not re.match(pattern, gstin):
            return False, "Invalid GSTIN format"
        
        return True, "Valid GSTIN"
    
    @staticmethod
    def validate_ifsc(ifsc):
        """Validate IFSC code format"""
        if not ifsc or len(ifsc) != 11:
            return False, "IFSC code must be 11 characters long"
        
        # IFSC format: 4 letters bank code + 1 digit (0) + 6 alphanumeric characters
        pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
        if not re.match(pattern, ifsc):
            return False, "Invalid IFSC code format"
        
        return True, "Valid IFSC code"
    
    @staticmethod
    def fetch_gst_details(gstin):
        """Fetch GST details from external API"""
        try:
            url = f"{GST_API_BASE_URL}/{GST_API_KEY}/{gstin}"
            logger.info(f"Fetching GST details for: {gstin}")
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('flag') != True:
                return {
                    'success': False,
                    'message': data.get('message', 'Failed to fetch GST details'),
                    'data': None
                }
            
            # Extract and format the data
            gst_data = data.get('data', {})
            address_data = gst_data.get('pradr', {}).get('addr', {})
            
            formatted_data = {
                'companyName': gst_data.get('tradeNam', ''),
                'legalName': gst_data.get('lgnm', ''),
                'address1': address_data.get('bnm', ''),
                'address2': address_data.get('st', ''),
                'city': address_data.get('dst', ''),
                'pincode': address_data.get('pncd', ''),
                'district': address_data.get('dst', ''),
                'state': address_data.get('stcd', ''),
                'gstin': gstin,
                'pan': gstin[2:12],  # Extract PAN from GSTIN
                'registrationDate': gst_data.get('rgdt', ''),
                'businessType': gst_data.get('ctb', ''),
                'status': gst_data.get('sts', ''),
                'fetchedAt': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'message': 'GST details fetched successfully',
                'data': formatted_data
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error while fetching GST details: {str(e)}")
            return {
                'success': False,
                'message': f'Network error: {str(e)}',
                'data': None
            }
        except Exception as e:
            logger.error(f"Error while fetching GST details: {str(e)}")
            return {
                'success': False,
                'message': f'Error fetching GST details: {str(e)}',
                'data': None
            }
    
    @staticmethod
    def fetch_bank_details(ifsc):
        """Fetch bank details from IFSC code"""
        try:
            url = f"{IFSC_API_BASE_URL}/{ifsc}"
            logger.info(f"Fetching bank details for IFSC: {ifsc}")
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if not data or 'BRANCH' not in data:
                return {
                    'success': False,
                    'message': 'Invalid IFSC code or bank details not found',
                    'data': None
                }
            
            # Format the bank data
            formatted_data = {
                'bankName': data.get('BANK', ''),
                'branch': data.get('BRANCH', ''),
                'address': data.get('ADDRESS', ''),
                'city': data.get('CITY', ''),
                'district': data.get('DISTRICT', ''),
                'state': data.get('STATE', ''),
                'ifscCode': ifsc,
                'micrCode': data.get('MICR', ''),
                'contact': data.get('CONTACT', ''),
                'fetchedAt': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'message': 'Bank details fetched successfully',
                'data': formatted_data
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error while fetching bank details: {str(e)}")
            return {
                'success': False,
                'message': f'Network error: {str(e)}',
                'data': None
            }
        except Exception as e:
            logger.error(f"Error while fetching bank details: {str(e)}")
            return {
                'success': False,
                'message': f'Error fetching bank details: {str(e)}',
                'data': None
            }

# Initialize the data fetcher
fetcher = DataFetcher()

@app.route('/')
def home():
    """Home endpoint with API information"""
    return jsonify({
        'message': 'Python API for GST and Bank Details',
        'version': '1.0.0',
        'endpoints': {
            'GET /': 'API information',
            'POST /api/gst': 'Fetch GST details',
            'POST /api/bank': 'Fetch bank details from IFSC',
            'POST /api/validate/gst': 'Validate GSTIN format',
            'POST /api/validate/ifsc': 'Validate IFSC format',
            'GET /api/health': 'Health check'
        },
        'usage': {
            'gst': {
                'method': 'POST',
                'url': '/api/gst',
                'body': {'gstin': '15-character GSTIN'}
            },
            'bank': {
                'method': 'POST',
                'url': '/api/bank',
                'body': {'ifsc': '11-character IFSC code'}
            }
        }
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Python GST/Bank API'
    })

@app.route('/api/validate/gst', methods=['POST'])
def validate_gstin():
    """Validate GSTIN format"""
    try:
        data = request.get_json()
        gstin = data.get('gstin', '').strip().upper()
        
        is_valid, message = fetcher.validate_gstin(gstin)
        
        return jsonify({
            'success': is_valid,
            'message': message,
            'gstin': gstin,
            'valid': is_valid
        })
        
    except Exception as e:
        logger.error(f"Error in GST validation: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Validation error: {str(e)}'
        }), 400

@app.route('/api/validate/ifsc', methods=['POST'])
def validate_ifsc():
    """Validate IFSC code format"""
    try:
        data = request.get_json()
        ifsc = data.get('ifsc', '').strip().upper()
        
        is_valid, message = fetcher.validate_ifsc(ifsc)
        
        return jsonify({
            'success': is_valid,
            'message': message,
            'ifsc': ifsc,
            'valid': is_valid
        })
        
    except Exception as e:
        logger.error(f"Error in IFSC validation: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Validation error: {str(e)}'
        }), 400

@app.route('/api/gst', methods=['POST'])
def fetch_gst():
    """Fetch GST details"""
    try:
        data = request.get_json()
        gstin = data.get('gstin', '').strip().upper()
        
        # Validate GSTIN first
        is_valid, message = fetcher.validate_gstin(gstin)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
        # Fetch GST details
        result = fetcher.fetch_gst_details(gstin)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error in GST fetch endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/bank', methods=['POST'])
def fetch_bank():
    """Fetch bank details from IFSC"""
    try:
        data = request.get_json()
        ifsc = data.get('ifsc', '').strip().upper()
        
        # Validate IFSC first
        is_valid, message = fetcher.validate_ifsc(ifsc)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
        # Fetch bank details
        result = fetcher.fetch_bank_details(ifsc)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error in bank fetch endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/bulk/gst', methods=['POST'])
def bulk_gst_fetch():
    """Fetch GST details for multiple GSTINs"""
    try:
        data = request.get_json()
        gstin_list = data.get('gstin_list', [])
        
        if not isinstance(gstin_list, list) or len(gstin_list) == 0:
            return jsonify({
                'success': False,
                'message': 'Please provide a list of GSTINs'
            }), 400
        
        if len(gstin_list) > 10:  # Limit to 10 GSTINs per request
            return jsonify({
                'success': False,
                'message': 'Maximum 10 GSTINs allowed per request'
            }), 400
        
        results = []
        for gstin in gstin_list:
            gstin = gstin.strip().upper()
            is_valid, _ = fetcher.validate_gstin(gstin)
            
            if is_valid:
                result = fetcher.fetch_gst_details(gstin)
                results.append({
                    'gstin': gstin,
                    'valid': True,
                    **result
                })
            else:
                results.append({
                    'gstin': gstin,
                    'valid': False,
                    'success': False,
                    'message': 'Invalid GSTIN format'
                })
        
        return jsonify({
            'success': True,
            'message': f'Processed {len(gstin_list)} GSTINs',
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Error in bulk GST fetch: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/bulk/bank', methods=['POST'])
def bulk_bank_fetch():
    """Fetch bank details for multiple IFSC codes"""
    try:
        data = request.get_json()
        ifsc_list = data.get('ifsc_list', [])
        
        if not isinstance(ifsc_list, list) or len(ifsc_list) == 0:
            return jsonify({
                'success': False,
                'message': 'Please provide a list of IFSC codes'
            }), 400
        
        if len(ifsc_list) > 10:  # Limit to 10 IFSC codes per request
            return jsonify({
                'success': False,
                'message': 'Maximum 10 IFSC codes allowed per request'
            }), 400
        
        results = []
        for ifsc in ifsc_list:
            ifsc = ifsc.strip().upper()
            is_valid, _ = fetcher.validate_ifsc(ifsc)
            
            if is_valid:
                result = fetcher.fetch_bank_details(ifsc)
                results.append({
                    'ifsc': ifsc,
                    'valid': True,
                    **result
                })
            else:
                results.append({
                    'ifsc': ifsc,
                    'valid': False,
                    'success': False,
                    'message': 'Invalid IFSC format'
                })
        
        return jsonify({
            'success': True,
            'message': f'Processed {len(ifsc_list)} IFSC codes',
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Error in bulk bank fetch: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting Python GST/Bank API Server...")
    print("📍 Server will run on http://localhost:5001")
    print("📚 Available endpoints:")
    print("   GET  /              - API information")
    print("   GET  /api/health    - Health check")
    print("   POST /api/gst       - Fetch GST details")
    print("   POST /api/bank      - Fetch bank details")
    print("   POST /api/validate/gst  - Validate GSTIN")
    print("   POST /api/validate/ifsc - Validate IFSC")
    print("   POST /api/bulk/gst  - Bulk GST fetch")
    print("   POST /api/bulk/bank - Bulk bank fetch")
    print("\n💡 Example usage:")
    print("   curl -X POST http://localhost:5001/api/gst -H 'Content-Type: application/json' -d '{\"gstin\":\"24DXCPP7145D1ZE\"}'")
    print("   curl -X POST http://localhost:5001/api/bank -H 'Content-Type: application/json' -d '{\"ifsc\":\"SBIN0001234\"}'")
    
    app.run(host='0.0.0.0', port=5001, debug=True) 