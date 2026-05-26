/**
 * WETS - Register New Patient
 * Patient registration form handling and validation
 */

// Contact persons array
let contactPersons = [];

// Form submission handler
const registrationForm = document.getElementById('registrationForm');

registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Collect form data
    const formData = collectFormData();
    
    // Submit patient data
    submitPatientData(formData);
});

// Validate form fields
function validateForm() {
    const requiredFields = registrationForm.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

// Collect all form data
function collectFormData() {
    const formData = {
        personalInfo: {
            nationalId: document.querySelector('input[type="text"]').value,
            firstName: document.querySelectorAll('input[type="text"]')[1].value,
            lastName: document.querySelectorAll('input[type="text"]')[2].value,
            gender: document.querySelector('select').value,
            mobile: document.querySelector('input[type="tel"]').value,
            telephone: document.querySelectorAll('input[type="tel"]')[1].value,
            email: document.querySelector('input[type="email"]').value,
            department: document.querySelectorAll('select')[1].value,
            maritalStatus: document.querySelectorAll('select')[2].value,
            bloodType: document.querySelectorAll('select')[3].value,
            dateOfBirth: document.querySelector('input[type="date"]').value,
            doctor: document.querySelectorAll('select')[4].value
        },
        addressInfo: {
            country: document.querySelectorAll('select')[5].value,
            governorate: document.querySelectorAll('.form-section')[1].querySelectorAll('input')[0].value,
            city: document.querySelectorAll('.form-section')[1].querySelectorAll('input')[1].value,
            village: document.querySelectorAll('.form-section')[1].querySelectorAll('input')[2].value,
            street: document.querySelectorAll('.form-section')[1].querySelectorAll('input')[3].value,
            nationality: document.querySelectorAll('select')[6].value
        },
        contactPersons: contactPersons
    };
    
    return formData;
}

// Submit patient data
function submitPatientData(formData) {
    const saveBtn = document.querySelector('.btn-save');
    saveBtn.classList.add('loading');
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        console.log('Patient data submitted:', formData);
        
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
        
        showNotification('Patient registered successfully!', 'success');
        
        // Redirect to search page after success
        setTimeout(() => {
            window.location.href = 'search.html';
        }, 1500);
    }, 2000);
}

// Add contact person
function addContact() {
    const contactType = document.getElementById('contactType').value;
    const contactDetail = document.getElementById('contactDetail').value;
    
    if (!contactDetail.trim()) {
        showNotification('Please enter contact details', 'error');
        return;
    }
    
    const contact = {
        type: contactType,
        detail: contactDetail,
        id: Date.now()
    };
    
    contactPersons.push(contact);
    renderContactList();
    
    // Clear input
    document.getElementById('contactDetail').value = '';
    
    showNotification('Contact added successfully', 'success');
}

// Render contact list
function renderContactList() {
    const contactList = document.getElementById('contactList');
    
    if (contactPersons.length === 0) {
        contactList.innerHTML = '';
        return;
    }
    
    contactList.innerHTML = contactPersons.map(contact => `
        <div class="contact-item" data-id="${contact.id}">
            <div class="contact-info">
                <span class="contact-type-badge">${contact.type.toUpperCase()}</span>
                <span>${contact.detail}</span>
            </div>
            <button class="remove-contact-btn" onclick="removeContact(${contact.id})">
                Remove
            </button>
        </div>
    `).join('');
}

// Remove contact person
function removeContact(contactId) {
    contactPersons = contactPersons.filter(c => c.id !== contactId);
    renderContactList();
    showNotification('Contact removed', 'info');
}

// Trigger file upload
function triggerFileUpload() {
    document.getElementById('photoUpload').click();
}

// Handle file upload
document.getElementById('photoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB', 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const uploadBox = document.querySelector('.upload-box');
            uploadBox.innerHTML = `
                <img src="${event.target.result}" alt="Patient Photo" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;">
                <span class="upload-text" style="margin-top: 0.5rem;">Change Photo</span>
            `;
            showNotification('Photo uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    }
});

// Input formatting
document.addEventListener('DOMContentLoaded', function() {
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove non-numeric characters
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });
    
    // Email validation on blur
    const emailInput = document.querySelector('input[type="email"]');
    emailInput.addEventListener('blur', function() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailPattern.test(this.value)) {
            this.classList.add('error');
            showNotification('Please enter a valid email address', 'error');
        } else {
            this.classList.remove('error');
        }
    });
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : 
                    type === 'warning' ? '#f59e0b' :
                    '#3b82f6';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .form-input.error,
    .form-select.error {
        border-color: #ef4444;
    }
`;
document.head.appendChild(style);

// Auto-save draft (optional feature)
let autoSaveTimeout;
const formInputs = document.querySelectorAll('.form-input, .form-select');

formInputs.forEach(input => {
    input.addEventListener('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            saveDraft();
        }, 2000);
    });
});

function saveDraft() {
    const formData = collectFormData();
    localStorage.setItem('patientDraft', JSON.stringify(formData));
    console.log('Draft saved automatically');
}

// Load draft on page load
window.addEventListener('load', function() {
    const draft = localStorage.getItem('patientDraft');
    if (draft) {
        console.log('Draft found:', JSON.parse(draft));
        // Could implement draft restoration here
    }
});