document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const inputs = document.querySelectorAll('.form-input');

    // Remove validation visual state classes during user typing
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim() !== "") {
                input.classList.remove('error');
                input.classList.add('success');
            } else {
                input.classList.remove('success');
            }
        });
    });

    // Handle interactive submit trigger animation
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let hasError = false;

        // Base field verification check
        inputs.forEach(input => {
            if (input.value.trim() === "") {
                input.classList.add('error');
                hasError = true;
            } else {
                input.classList.remove('error');
            }
        });

        if (hasError) return;

        // Trigger presentation loading circle on form submission success
        submitBtn.classList.add('loading');
        
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            alert('Sign-In UI simulated successfully!');
            // To link back to landing dashboard: window.location.href = 'index.html';
        }, 1800);
    });
});