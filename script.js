document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const folderSelect = document.getElementById("folderSelect");
  const statusDiv = document.getElementById("status");
  const uploadBtn = document.getElementById("uploadBtn");
  const folderDescription = document.getElementById("folderDescription");

  // Folder descriptions
  const folderDescriptions = {
    salvation:
      "Share your story of accepting Jesus Christ and finding salvation",
    healing: "Testimonies of physical, emotional, or spiritual healing",
    deliverance:
      "Stories of freedom from addiction, fear, or spiritual bondage",
    breakthrough: "Overcoming financial, relational, or personal obstacles",
    word: "How God's word spoke to you or promises that were fulfilled",
  };

  // Update description when folder is selected
  folderSelect.addEventListener("change", function () {
    const selectedFolder = folderSelect.value;
    if (selectedFolder && folderDescriptions[selectedFolder]) {
      folderDescription.textContent = folderDescriptions[selectedFolder];
      folderDescription.style.display = "block";
    } else {
      folderDescription.style.display = "none";
    }
  });

  // Handle form submission
  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validation
    if (!fileInput.files[0]) {
      showStatus("❌ Please select a file first!", "error");
      return;
    }

    if (!folderSelect.value) {
      showStatus("❌ Please select a category first!", "error");
      return;
    }

    const file = fileInput.files[0];
    const filename = file.name;
    const selectedFolder = folderSelect.value;
    const folderPath = `${selectedFolder}/${filename}`;

    // Disable form during upload
    uploadBtn.disabled = true;
    uploadBtn.textContent = "⏳ Uploading...";

    showStatus(
      `📤 Uploading "${filename}" to ${selectedFolder} category...`,
      "info"
    );

    try {
      // Step 1: Get presigned URL with folder path
      console.log("Requesting presigned URL for:", folderPath);

      const response = await fetch(
        "https://wbak63g32mlhfel2743vpspha40brlml.lambda-url.eu-west-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: folderPath,
            folder: selectedFolder,
            originalFilename: filename,
          }),
          // Explicitly set mode for CORS
          mode: "cors",
          credentials: "omit",
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Access denied: This application can only be used from the official website."
          );
        }
        throw new Error(`Failed to get upload URL: ${response.status}`);
      }

      const data = await response.json();
      console.log("Got presigned URL data:", data);

      // Step 2: Upload the file to S3
      showStatus(`📤 Uploading "${filename}" to S3...`, "info");

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (uploadResponse.ok) {
        showStatus(
          `✅ Testimony "${filename}" uploaded successfully to ${selectedFolder} category!`,
          "success"
        );
        console.log("Upload successful!");

        // Reset form
        fileInput.value = "";
        folderSelect.value = "";
        folderDescription.style.display = "none";
      } else {
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Handle specific CORS errors
      if (
        error.message.includes("CORS") ||
        error.message.includes("Access denied")
      ) {
        showStatus(`❌ ${error.message}`, "error");
      } else {
        showStatus(`❌ Upload failed: ${error.message}`, "error");
      }
    } finally {
      // Re-enable form
      uploadBtn.disabled = false;
      uploadBtn.textContent = "🚀 Upload Testimony";
    }
  });

  // Helper function to show status messages
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status-${type}`;

    // Auto-hide success messages after 5 seconds
    if (type === "success") {
      setTimeout(() => {
        statusDiv.textContent = "";
        statusDiv.className = "";
      }, 5000);
    }
  }
});
