const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const statusText = document.getElementById("status");

// 🧠 Replace this with your actual Lambda Function URL
const LAMBDA_URL =
  "https://wbak63g32mlhfel2743vpspha40brlml.lambda-url.eu-west-1.on.aws/";

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    statusText.textContent = "Please select a file first.";
    return;
  }

  statusText.textContent = "Generating upload link...";

  try {
    // Request pre-signed URL from Lambda
    const response = await fetch(LAMBDA_URL);
    const data = await response.json();

    if (!data.uploadUrl) {
      throw new Error("Failed to get upload URL.");
    }

    const uploadUrl = data.uploadUrl;

    statusText.textContent = "Uploading to S3...";

    // Upload file directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (uploadResponse.ok) {
      statusText.textContent = "✅ Upload successful!";
    } else {
      throw new Error("Upload failed.");
    }
  } catch (err) {
    console.error(err);
    statusText.textContent = "❌ Error: " + err.message;
  }
});
