document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const username = document.getElementById('userName').value; 
    const email = document.getElementById('userEmail').value; 
    const password = document.getElementById('userPw').value; 
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            email, 
            password 
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); 
        if (data.code === 200) {
            window.location.href = '/signin'; 
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('회원가입 중 문제가 발생했습니다.');
    });
});
