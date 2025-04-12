function openModal(src, title, link) {
    const modal = document.getElementById("imgModal");
    const modalImage = document.getElementById("modalImage");
  
    modal.style.display = "block";
    modalImage.src = src;
  }
  
  function closeModal() {
    document.getElementById("imgModal").style.display = "none";
  }