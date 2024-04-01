document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signinForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value; 
        const password = document.getElementById('userPw').value; 
        fetch('/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password 
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message); 
            if (data.code === 200) {
                localStorage.setItem('userId', data.userId);
                window.location.href = '/order';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('로그인 중 문제가 발생했습니다.');
        });
    });
});
