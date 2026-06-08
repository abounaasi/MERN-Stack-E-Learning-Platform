import React, { useEffect, useState } from "react";
import "./certificate.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";

const Certificate = () => {
  const params = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchCertificate() {
    try {
      const { data } = await axios.get(
        `${server}/api/certificate/${params.id}`,
      );
      setCertificate(data.certificate);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCertificate();
  }, []);

  if (loading) return <Loading />;

  if (!certificate)
    return (
      <div className="certificate-page">
        <div className="certificate-invalid">
          <h2>Certificate Not Found</h2>
          <p>This certificate ID is invalid or does not exist.</p>
        </div>
      </div>
    );

  const issueDate = new Date(certificate.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="certificate-page">
      <div className="certificate-card">
        <span className="certificate-verified">✓ Verified Certificate</span>

        <h1 className="certificate-heading">Certificate of Completion</h1>

        <p className="certificate-text">This is to certify that</p>
        <h2 className="certificate-name">{certificate.studentName}</h2>

        <p className="certificate-text">has successfully completed the course</p>
        <h3 className="certificate-course">{certificate.courseName}</h3>

        <div className="certificate-meta">
          <div>
            <span className="meta-label">Instructor</span>
            <span className="meta-value">{certificate.instructorName}</span>
          </div>
          <div>
            <span className="meta-label">Completion Date</span>
            <span className="meta-value">{issueDate}</span>
          </div>
        </div>

        <div className="certificate-id">
          Certificate ID: <code>{certificate.certificateId}</code>
        </div>

        <a
          href={`${server}/api/certificate/${certificate.certificateId}/download`}
          className="certificate-download"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
};

export default Certificate;
