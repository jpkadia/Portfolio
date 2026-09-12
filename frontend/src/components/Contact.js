import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Contact.css';
import './Contact_m.css';

// 🆕 Import custom hook and animation CSS
import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/ScrollAnimation.css'; // If not already globally imported

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api/contact";
      const response = await axios.post(apiUrl, formData);
      setStatus({
        type: 'success',
        message: response.data?.message || "Message sent successfully! We will get in touch soon."
      });
      setFormData({ name: '', mobile: '', message: '' });
    } catch (error) {
      let errMsg = "Error sending message. Please try again.";
      if (!error.response) {
        errMsg = "Backend server is not running or unreachable. Please start backend with 'npm run server'.";
      } else if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      setStatus({ type: 'error', message: errMsg });
      console.error('Contact form submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Typewriter animation for "GET IN TOUCH"
  const [text, setText] = useState('');
  const fullText = 'GET IN TOUCH';

    // 🆕 Hook for scroll animation
  const [ref, isVisible] = useScrollAnimation();


  useEffect(() => {
    let index = 0;
    let interval;

    const type = () => {
      interval = setInterval(() => {
        if (index < fullText.length) {
          setText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setText('');
            index = 0;
            type(); // Restart loop
          }, 2000);
        }
      }, 150);
    };

    type();
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className={`contact-section scroll-animate ${isVisible ? 'visible' : ''}`}
      id="contact"
      ref={ref}
      aria-label="Contact Section"
    >
      <div className="contact-container">
        <p className="contact-subtitle typing-text" aria-label="GET IN TOUCH">{text}</p>
        <h2 className="contact-title">Have a Project or Technical Query? Let’s Connect and Create!</h2>

        <form onSubmit={handleSubmit} className="contact-form" aria-label="Contact form">
          <div className="form-group">
            <input
              id="contact-name"
              type="text"
              name="name"
              placeholder="Enter Your Name"
              aria-label="Your Name"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              id="contact-mobile"
              type="tel"
              name="mobile"
              placeholder="Enter Your Mobile Number"
              aria-label="Your 10-Digit Mobile Number"
              autoComplete="tel"
              required
              pattern="[0-9]{10}"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <textarea
              id="contact-message"
              name="message"
              placeholder="Enter Your Message"
              aria-label="Your Message"
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
          </div>
          {status.message && (
            <div
              className={`contact-status-message status-${status.type}`}
              role="alert"
              aria-live="polite"
            >
              {status.message}
            </div>
          )}
          <button
            type="submit"
            className="send-button"
            disabled={isSubmitting}
            aria-label={isSubmitting ? 'Sending message' : 'Send Message'}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
