function handleResumeUpload(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('resumeOutput').innerHTML = `
      <p>Resume uploaded: ${file.name}</p>
      <p>AI Analysis: Strengths - Good technical skills. Weaknesses - Improve soft skills.</p>
      <p>ATS Score: 78/100</p>
    `;
  }
}

function generateRoadmap(event) {
  event.preventDefault();
  const branch = document.getElementById('branch').value;
  const role = document.getElementById('role').value;
  document.getElementById('roadmapOutput').innerHTML = `
    <p>Roadmap for ${branch} targeting ${role}:</p>
    <ul>
      <li>Week 1: Revise core subjects</li>
      <li>Week 2: Practice coding problems</li>
      <li>Week 3: Mock interviews</li>
    </ul>
  `;
}

function startMockInterview() {
  document.getElementById('mockInterviewOutput').innerHTML = `
    <p>Question 1: Tell me about yourself.</p>
    <p>Question 2: Explain a project you worked on.</p>
    <p>Evaluation: Good communication skills. Score: 85/100</p>
  `;
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}