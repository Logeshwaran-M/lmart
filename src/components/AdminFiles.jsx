import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchAdminFiles = () => {
    setOpen(!open);

    if (!open) {
      const q = query(
        collection(db, "uploadfile"),
        where("customerUserId", "==", user.uid)
      );

      onSnapshot(q, (snapshot) => {
        let arr = [];

        snapshot.docs.forEach((docItem) => {
          const data = docItem.data();

          if (Array.isArray(data.files)) {
            data.files
              // ✔ Fetch ONLY Admin files (HAS downloadURL)
              .filter((f) => f.downloadURL)
              .forEach((file) => {
                arr.push({
                  parentDocId: docItem.id,
                  folder: data.uploadId,
                  ...file,
                });
              });
          }
        });

        setFiles(arr);
      });
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow">

      {/* Folder icon RIGHT */}
      <div
        onClick={fetchAdminFiles}
        className="flex justify-between items-center cursor-pointer mb-4"
      >
        <h2 className="text-xl font-bold">Files Sent by Admin</h2>
        <span className="text-3xl">📁</span>
      </div>

      {open && (
        <div>
          {files.length === 0 ? (
            <p>No admin files found.</p>
          ) : (
            files.map((file) => (
              <div key={file.fileId} className="mb-3 p-3 border rounded-lg">

                <p className="text-xs text-gray-600">
                  Folder: /uploadfile/{file.folder}
                </p>

                <p className="font-semibold">{file.originalName}</p>

                {/* ADMIN FILE ALWAYS HAS downloadURL */}
                <a
                  href={file.downloadURL}
                  className="text-blue-600 underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.downloadURL}
                </a>

                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2"
                  onClick={() => window.open(file.downloadURL, "_blank")}
                >
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFiles;
