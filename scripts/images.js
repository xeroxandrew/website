function openModal(src, link, linkText) {
    const modal = document.getElementById("imgModal");
    const modalImage = document.getElementById("modalImage");
    const modalLink = document.getElementById("modalLink");

    modal.style.display = "block";
    modalImage.src = src;
    modalLink.href = link;
    modalLink.textContent = linkText;
  }
  
  function closeModal() {
    document.getElementById("imgModal").style.display = "none";
  }