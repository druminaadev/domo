import React, { useState, useRef, useCallback, useEffect } from 'react';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  image: string | null;
}

const CustomerAddPage: React.FC = () => {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    image: null
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        alert('Unable to start camera preview. Please try again.');
      });
    }
  }, [stream, isCapturing]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' // Use front camera
        } 
      });
      
      setStream(mediaStream);
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  // Capture image
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!video.videoWidth || !video.videoHeight) {
        alert('Camera is still loading. Please try again in a moment.');
        return;
      }
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 image
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Update customer data with captured image
        setCustomerData(prev => ({
          ...prev,
          image: imageDataUrl
        }));
        
        // Stop camera after capture
        stopCamera();
        
        alert('Image captured successfully!');
      }
    }
  }, [stopCamera]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields
    if (!customerData.name.trim()) {
      alert('Please enter customer name');
      document.getElementById('name')?.focus();
      return false;
    }
    
    if (!customerData.email.trim()) {
      alert('Please enter customer email');
      document.getElementById('email')?.focus();
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      alert('Please enter a valid email address');
      document.getElementById('email')?.focus();
      return false;
    }
    
    try {
      console.log('Customer Data:', customerData);
      
      // Here you would typically send data to your API
      // await saveCustomer(customerData);
      
      alert('Customer registered successfully!');
      
      // Reset form after successful submission
      setCustomerData({
        name: '',
        email: '',
        phone: '',
        image: null
      });
      
      return true;
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to register customer. Please try again.');
      return false;
    }
  };

  // Remove captured image
  const removeImage = () => {
    setCustomerData(prev => ({
      ...prev,
      image: null
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Add New Customer</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerData.name}
            onChange={handleInputChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerData.email}
            onChange={handleInputChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerData.phone}
            onChange={handleInputChange}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Camera Section */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Customer Photo</h3>
          
          {!isCapturing && !customerData.image && (
            <button
              type="button"
              onClick={startCamera}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📷 Start Camera
            </button>
          )}

          {isCapturing && (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  border: '2px solid #007bff',
                  borderRadius: '8px'
                }}
              />
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={captureImage}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  📸 Capture Image
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

          {customerData.image && (
            <div>
              <h4>Captured Image:</h4>
              <img
                src={customerData.image}
                alt="Customer"
                style={{
                  width: '200px',
                  height: '150px',
                  objectFit: 'cover',
                  border: '2px solid #28a745',
                  borderRadius: '8px'
                }}
              />
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '5px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  🗑️ Remove Image
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 15px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📷 Retake Photo
                </button>
              </div>
            </div>
          )}

          {/* Hidden canvas for image capture */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          Register Customer
        </button>
      </form>
    </div>
  );
};

export default CustomerAddPage;
