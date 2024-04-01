document.addEventListener("DOMContentLoaded", () => {
  const buyNowButtons = document.querySelectorAll(".buy-now");
  buyNowButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = localStorage.getItem("userId"); 
      const productId = this.getAttribute("data-product-id");
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }
      fetch("/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 200) {
            alert("구매가 성공적으로 처리되었습니다.");
          } else {
            alert(data.message);
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const purchaseButton = document.getElementById('purchaseHistoryButton');
  purchaseButton.addEventListener('click', function() {
      const userId = localStorage.getItem('userId');
      if (userId) {
          window.location.href = `/purchase?userId=${userId}`;
      } else {
          alert('로그인이 필요합니다.');
          window.location.href = '/signin'; 
      }
  });
});



document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logoutButton");
  logoutButton.addEventListener("click", function (e) {
    e.preventDefault(); 
    localStorage.removeItem("userId"); 
    window.location.href = "/signin"; 
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const reviewForms = document.querySelectorAll(".review-form");

  reviewForms.forEach(form => {
      form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const formData = new FormData(form);
          const reviewText = formData.get("reviewText");
          const productId = formData.get("productId");
          const userId = localStorage.getItem("userId");
          try {
              const response = await fetch("/submit-review", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId, productId, reviewText })
              });

              const data = await response.json();

              if (data.success) {
                  alert(data.message); 
              } else {
                  alert(data.message); 
              }
          } catch (error) {
              console.error("Failed to submit review:", error);
              alert("There was a problem submitting your review.");
          }
      });
  });
});


document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.viewAllReviewsBtn').forEach(button => {
      button.onclick = function() {
          var productId = this.id.split('-')[1];
          var modal = document.getElementById('reviewsModal-' + productId);
          modal.style.display = "block";
      };
  });

  document.querySelectorAll('.close').forEach(span => {
      span.onclick = function() {
          this.parentElement.parentElement.style.display = "none";
      };
  });

  window.onclick = function(event) {
      if (event.target.classList.contains('modal')) {
          event.target.style.display = "none";
      }
  };
});


