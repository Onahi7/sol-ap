document.addEventListener('DOMContentLoaded', function() {
    // Particle.js configuration
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 } },
            opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
            modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
        },
        retina_detect: true
    });

    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.backgroundColor = 
            type === 'error' ? 'var(--error-color)' : 
            type === 'success' ? 'var(--success-color)' : 
            'var(--primary-color)';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Form validation
    function validateForm() {
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        let isValid = true;

        // Name validation
        if (!name.value.trim()) {
            nameError.textContent = 'Name is required';
            isValid = false;
        } else if (!name.value.match(/^[a-zA-Z\s-']+$/)) {
            nameError.textContent = 'Name can only contain letters, spaces, hyphens, and apostrophes';
            isValid = false;
        } else if (name.value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters long';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            emailError.textContent = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email.value)) {
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        return isValid;
    }

    // Wallet connection
    let walletAddress = null;

    async function connectWallet() {
        if (typeof window.solana !== 'undefined') {
            try {
                const response = await window.solana.connect();
                walletAddress = response.publicKey.toString();
                showToast(`Wallet connected: ${walletAddress.slice(0, 8)}...`, 'success');
                document.getElementById('connectWallet').textContent = 'Wallet Connected';
                document.getElementById('connectWallet').disabled = true;
                document.getElementById('walletAddress').style.display = 'block';
                document.getElementById('walletAddressText').textContent = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
                document.getElementById('submitButton').disabled = false;
            } catch (err) {
                console.error(err);
                showToast('Failed to connect wallet', 'error');
            }
        } else {
            showToast('Phantom wallet is not installed', 'error');
        }
    }

    // Get location
    function getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
            } else {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }
        });
    }

    // Form submission
    document.getElementById('distributionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (validateForm()) {
            const loading = document.createElement('div');
            loading.textContent = 'Submitting...';
            loading.style.position = 'fixed';
            loading.style.top = '0';
            loading.style.left = '0';
            loading.style.width = '100%';
            loading.style.height = '100%';
            loading.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            loading.style.display = 'flex';
            loading.style.justifyContent = 'center';
            loading.style.alignItems = 'center';
            loading.style.color = '#fff';
            loading.style.fontSize = '24px';
            loading.style.zIndex = '9999';
            document.body.appendChild(loading);

            try {
                const position = await getLocation();
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    wallet: walletAddress,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: new Date().toISOString()
                };

                const response = await fetch('https://script.google.com/macros/s/AKfycbyd-Vjp3SwIjlBS3VXTW0nqcqSAobv_r7eOyBjXaIG69ItzlQxYtH24wu63JezlRCc7/exec', {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                document.body.removeChild(loading);
                
                if (response.type === 'opaque' || response.ok) {
                    const successUrl = new URL('success.html', window.location.href);
                    successUrl.searchParams.set('wallet', walletAddress);
                    window.location.href = successUrl.toString();
                } else {
                    throw new Error('Failed to submit form');
                }
            } catch (error) {
                document.body.removeChild(loading);
                console.error('Submission error:', error);
                showToast('Error submitting application. Please try again.', 'error');
            }
        }
    });

    // Connect wallet button
    document.getElementById('connectWallet').addEventListener('click', connectWallet);

    // Mobile menu toggle
    function toggleMenu() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    }

    // Setup form input validation on blur
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateForm);
    });
});

