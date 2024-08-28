/* scripts.js */
function showPixQRCode(qrCodeUrl) {
    document.getElementById("pixQRCode").src = qrCodeUrl;
    document.getElementById("pixModal").style.display = "block";
}

function closePixQRCode() {
    document.getElementById("pixModal").style.display = "none";
}

function copyPixKey() {
    const pixKey = document.getElementById("pixKey").textContent;
    navigator.clipboard.writeText(pixKey).then(() => {
        alert("Chave Pix copiada para a área de transferência!");
    });
}
