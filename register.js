/**
 * WETS - Register New Patient
 * Patient registration form handling and validation
 */

let contactPersons = [];
const registrationForm = document.getElementById('registrationForm');

registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm()) return;
    
    const formData = collectFormData();
    submitPatientData(formData);
});

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

// Fixed data collection using explicit input properties
function collectFormData() {
    const getVal = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.value : '';
    };

    return {
        personalInfo: {
            nationalId: getVal('input[name="nationalId"]'),
            firstName: getVal('input[name="firstName"]'),
            lastName: getVal('input[name="lastName"]'),
            gender: getVal('select[name="gender"]'),
            mobile: getVal('input[name="mobile"]'),
            telephone: getVal('input[name="telephone"]'),
            email: getVal('input[name="email"]'),
            department: getVal('select[name="department"]'),
            maritalStatus: getVal('select[name="maritalStatus"]'),
            bloodType: getVal('select[name="bloodType"]'),
            dateOfBirth: getVal('input[name="dateOfBirth"]'),
            doctor: getVal('select[name="doctor"]')
        },
        addressInfo: {
            country: getVal('select[name="country"]'),
            governorate: getVal('input[name="governorate"]'),
            city: getVal('input[name="city"]'),
            village: getVal('input[name="village"]'),
            street: getVal('input[name="street"]'),
            nationality: getVal('select[name="nationality"]')
        },
        contactPersons: contactPersons
    };
}

function submitPatientData(formData) {
    const saveBtn = document.querySelector('.btn-save');
    saveBtn.classList.add('loading');
    saveBtn.disabled = true;
    
    setTimeout(() => {
        console.log('Patient data submitted:', formData);
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
        
        showNotification('Patient registered successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'search.html';
        }, 1500);
    }, 2000);
}

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
    document.getElementById('contactDetail').value = '';
    showNotification('Contact added successfully', 'success');
}

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
            <button type="button" class="remove-contact-btn" onclick="removeContact(${contact.id})">
                Remove
            </button>
        </div>
    `).join('');
}

function removeContact(contactId) {
    contactPersons = contactPersons.filter(c => c.id !== contactId);
    renderContactList();
    showNotification('Contact removed', 'info');
}

function triggerFileUpload() {
    document.getElementById('photoUpload').click();
}

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
                <img src="${event.target.result}" alt="Patient Photo" style="max-width: 45px; height: 45px; object-fit: cover; border-radius: 50%;">
                <span class="upload-text">Change Photo</span>
            `;
            showNotification('Photo uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });
    
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailPattern.test(this.value)) {
                this.classList.add('error');
                showNotification('Please enter a valid email address', 'error');
            } else {
                this.classList.remove('error');
            }
        });
    }
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : 
                    type === 'warning' ? '#f59e0b' : '#3b82f6';
    
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

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    .form-input.error, .form-select.error { border-color: #ef4444 !important; }
`;
document.head.appendChild(style);