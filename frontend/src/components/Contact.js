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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level JavaScript validator
  const validateField = (fieldName, value) => {
    const val = value !== undefined && value !== null ? String(value).trim() : '';
    switch (fieldName) {
      case 'name':
        if (!val) {
          return 'Name is required.';
        }
        if (val.length < 2) {
          return 'Name must be at least 2 characters long.';
        }
        if (val.length > 70) {
          return 'Name cannot exceed 70 characters.';
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) {
          return 'Name should contain only letters and spaces.';
        }
        return '';

      case 'mobile':
        if (!val) {
          return 'Mobile number is required.';
        }
        if (!/^[0-9]+$/.test(val)) {
          return 'Mobile number must contain digits only.';
        }
        if (val.length !== 10) {
          return 'Mobile number must be exactly 10 digits.';
        }
        if (!/^[6-9][0-9]{9}$/.test(val)) {
          return 'Please enter a valid 10-digit mobile number starting with 6-9.';
        }
        return '';

      case 'message':
        if (!val) {
          return 'Message is required.';
        }
        if (val.length < 10) {
          return 'Message must be at least 10 characters long.';
        }
        if (val.length > 2000) {
          return 'Message cannot exceed 2000 characters.';
        }
        return '';

      default:
        return '';
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // For mobile, restrict to numeric digits up to 10
    if (name === 'mobile') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

    // Re-validate in real time if field was touched or currently has an error
    if (touched[name] || errors[name]) {
      const error = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate all fields
    const nameErr = validateField('name', formData.name);
    const mobileErr = validateField('mobile', formData.mobile);
    const messageErr = validateField('message', formData.message);

    const validationErrors = {};
    if (nameErr) validationErrors.name = nameErr;
    if (mobileErr) validationErrors.mobile = mobileErr;
    if (messageErr) validationErrors.message = messageErr;

    setTouched({ name: true, mobile: true, message: true });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      if (nameErr) {
        document.getElementById('contact-name')?.focus();
      } else if (mobileErr) {
        document.getElementById('contact-mobile')?.focus();
      } else if (messageErr) {
        document.getElementById('contact-message')?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api/contact";
      const response = await axios.post(apiUrl, {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        message: formData.message.trim()
      });
      setStatus({
        type: 'success',
        message: response.data?.message || "Message sent successfully! We will get in touch soon."
      });
      setFormData({ name: '', mobile: '', message: '' });
      setTouched({});
      setErrors({});
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

  // Auto-dismiss success message after 4 seconds
  useEffect(() => {
    if (status.type === 'success') {
      const timer = setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Typewriter animation for "GET IN TOUCH"
  const [text, setText] = useState('');
  const fullText = 'GET IN TOUCH';

  // Hook for scroll animation
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

        <form onSubmit={handleSubmit} className="contact-form" aria-label="Contact form" noValidate>
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
              onBlur={handleBlur}
              className={touched.name && errors.name ? 'input-error' : ''}
              aria-invalid={!!(touched.name && errors.name)}
              aria-describedby={touched.name && errors.name ? "name-error" : undefined}
            />
            {touched.name && errors.name && (
              <span id="name-error" className="field-error-text" role="alert">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.name}
              </span>
            )}
          </div>
          <div className="form-group">
            <input
              id="contact-mobile"
              type="tel"
              name="mobile"
              placeholder="Enter Your Mobile Number (10 digits)"
              aria-label="Your 10-Digit Mobile Number"
              autoComplete="tel"
              required
              maxLength="10"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.mobile && errors.mobile ? 'input-error' : ''}
              aria-invalid={!!(touched.mobile && errors.mobile)}
              aria-describedby={touched.mobile && errors.mobile ? "mobile-error" : undefined}
            />
            {touched.mobile && errors.mobile && (
              <span id="mobile-error" className="field-error-text" role="alert">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.mobile}
              </span>
            )}
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
              onBlur={handleBlur}
              className={touched.message && errors.message ? 'input-error' : ''}
              aria-invalid={!!(touched.message && errors.message)}
              aria-describedby={touched.message && errors.message ? "message-error" : undefined}
            ></textarea>
            {touched.message && errors.message && (
              <span id="message-error" className="field-error-text" role="alert">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.message}
              </span>
            )}
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
