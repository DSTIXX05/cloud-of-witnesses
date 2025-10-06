document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const statusDiv = document.getElementById("status");

  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!fileInput.files[0]) {
      statusDiv.innerHTML = "❌ Please select a file first!";
      return;
    }

    const file = fileInput.files[0];
    const filename = file.name; // Get the actual filename

    statusDiv.innerHTML = `📤 Uploading "${filename}"...`;

    try {
      // Step 1: Get presigned URL with the actual filename
      console.log("Requesting presigned URL for:", filename);

      const response = await fetch(
        "https://wbak63g32mlhfel2743vpspha40brlml.lambda-url.eu-west-1.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: filename, // Pass the actual filename here
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.status}`);
      }

      const data = await response.json();
      console.log("Got presigned URL data:", data);

      // Step 2: Upload the file to S3
      statusDiv.innerHTML = `📤 Uploading "${filename}" to S3...`;

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (uploadResponse.ok) {
        statusDiv.innerHTML = `✅ File "${filename}" uploaded successfully!`;
        console.log("Upload successful!");

        // Reset form
        fileInput.value = "";
      } else {
        throw new Error(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      statusDiv.innerHTML = `❌ Upload failed: ${error.message}`;
    }
  });
});
