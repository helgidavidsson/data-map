// src/components/MapSelectionModal.js
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import styles from './MapSelectionModal.module.css';

function MapSelectionModal({ show, onClose, onCreateMap }) {
  
  const [selectedMap, setSelectedMap] = useState(null);

  const handleCreateMap = () => {
    if (selectedMap) {
      onCreateMap(selectedMap);
    } else {
      alert('Please select a map type.');
    }
  };

  if (!show) {
    return null;
  }

  const modalContent = (
       <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Select a Map</h2>
        <div className={styles.mapOptions}>
          <div
            className={`${styles.mapOption} ${selectedMap === 'world' ? styles.selected : ''}`}
            onClick={() => setSelectedMap('world')}
          >
            World Map
          </div>
          <div
            className={`${styles.mapOption} ${selectedMap === 'usa' ? styles.selected : ''}`}
            onClick={() => setSelectedMap('usa')}
          >
            USA Map
          </div>
          <div
            className={`${styles.mapOption} ${selectedMap === 'europe' ? styles.selected : ''}`}
            onClick={() => setSelectedMap('europe')}
          >
            Europe Map
          </div>
        </div>
        <button className={styles.viewButton} onClick={handleCreateMap}>Create</button>
        <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
      </div>
    </div>
    
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root') // Ensure this matches the id in index.html
  );
}

export default MapSelectionModal;
