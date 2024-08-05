// Guestbook - version 0.0.0 (initial development)
// Licensed under GNU GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
// Author: Viihna Lehraine (viihna@viihnatech.com || viihna.78 (Signal) || Viihna-Lehraine (Github))



import { updatePasswordStrength, validatePasswordsMatch } from "../exports.js";


document.getElementById('registration-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const password = document.getElementById('registration-box-user-password-input').value;
    const confirmPassword = document.getElementById('registration-box-user-password-confirm-input').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // continue with form submission
    const formData = {
        username: document.getElementById('registration-box-user-username-input').value,
        email: document.getElementById('registration-box-user-email-input').value,
        password: password
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success: ', data);
    })
    .catch((error) => {
        console.error('Error: ', error);
    });
});


// Change password strength meter output based on input
document.getElementById('registration-box-user-password-input').addEventListener('input', updatePasswordStrength);
document.getElementById('registration-box-user-confirm-password').addEventListener('input', validatePasswordsMatch);