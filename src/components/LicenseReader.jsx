import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

export default function LicenseReader() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setText('');
    }
  };

  const handleReadText = () => {
    if (!image) return;

    setLoading(true);
    Tesseract.recognize(image, 'eng', {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setText('Error reading text.');
      });
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>📷 License Plate Reader</h2>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ marginBottom: '1rem' }}
      />
      {image && (
        <div style={{ marginBottom: '1rem' }}>
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: '300px', borderRadius: '12px' }}
          />
        </div>
      )}
      <button onClick={handleReadText} disabled={!image || loading}>
        {loading ? 'Reading...' : 'Read Plate Text'}
      </button>

      {text && (
        <div style={{ marginTop: '2rem' }}>
          <h3>📝 Detected Text:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color: 'darkgreen' }}>{text}</pre>
        </div>
      )}
    </div>
  );
}
