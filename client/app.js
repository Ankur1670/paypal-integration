document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const email = document.getElementById('email').value;
    const courseSelect = document.getElementById('course');
    const selectedOption = courseSelect.options[courseSelect.selectedIndex];
    const coursePrice = selectedOption.getAttribute('data-price');
    
    // Store data in localStorage
    localStorage.setItem('coursePrice', coursePrice);
    localStorage.setItem('email', email);

    // Render PayPal button
    renderPayPalButton();
});

function renderPayPalButton() {
    paypal.Buttons({
        createOrder: function(data, actions) {
            const coursePrice = localStorage.getItem('coursePrice');
            const email = localStorage.getItem('email');

            return fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: coursePrice, email: email })
            }).then(function(res) {
                return res.json();
            }).then(function(orderData) {
                return orderData.id;
            });
        },
        onApprove: function(data, actions) {
            return fetch(`/api/orders/${data.orderID}/capture`, {
                method: 'POST',
            }).then(function(res) {
                return res.json();
            }).then(function(details) {
                // Extract the coursePrice and email from localStorage
                const coursePrice = localStorage.getItem('coursePrice');
                const email = localStorage.getItem('email');
                
                // Redirect to success page with query parameters
                window.location.href = `/success.html?transactionId=${data.orderID}&coursePrice=${coursePrice}&email=${email}`;
            });
        },
        onCancel: function(data) {
            // Redirect to cancel page
            window.location.href = '/cancel.html';
        },
        onError: function(err) {
            // Handle errors here
            console.error('PayPal Checkout error:', err);
            alert('An error occurred during the payment process.');
        }
    }).render('#paypal-button-container');
}
