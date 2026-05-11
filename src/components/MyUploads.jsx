import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  orderBy 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const MyUploads = () => {
  const [fileDocs, setFileDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  // GET CURRENT USER FROM FIREBASE AUTH
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Firebase Auth User:", user);
      setCurrentUser(user);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // FETCH USER'S UPLOADED FILES FROM FIREBASE
  useEffect(() => {
    if (userLoading) return;
    
    if (!currentUser) {
      console.log("No user logged in");
      setLoading(false);
      setFileDocs([]);
      return;
    }

    console.log("Fetching files for user:", {
      uid: currentUser.uid,
      email: currentUser.email
    });

    // Query to find user's uploaded files
    const queries = [
      query(collection(db, "uploadfile"), 
            where("customerId", "==", currentUser.uid),
            orderBy("createdAt", "desc")),
      
      query(collection(db, "uploadfile"), 
            where("customerEmail", "==", currentUser.email),
            orderBy("createdAt", "desc")),
    ];

    const unsubscribeFunctions = [];
    let allResults = [];

    queries.forEach((q, index) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            // Filter to show only user-uploaded files (non-admin files)
            .map(doc => ({
              ...doc,
              files: (doc.files || []).filter(file => 
                !file.adminUploaded && file.downloadURL // User uploads only
              )
            }))
            // Remove documents that have no user-uploaded files
            .filter(doc => doc.files.length > 0);
          
          console.log(`Query ${index} found ${docs.length} user-uploaded documents`);
          
          // Add to all results and remove duplicates
          allResults = [...allResults, ...docs];
          const uniqueDocs = Array.from(
            new Map(allResults.map(doc => [doc.id, doc])).values()
          );
          
          setFileDocs(uniqueDocs);
          setLoading(false);
        },
        (error) => {
          console.error(`Query ${index} error:`, error);
          
          // If both queries fail, try a fallback
          if (index === queries.length - 1) {
            fetchAllDocuments();
          }
        }
      );
      
      unsubscribeFunctions.push(unsubscribe);
    });

    // Fallback function to fetch all documents
    const fetchAllDocuments = () => {
      console.log("Trying fallback fetch...");
      const allQuery = query(collection(db, "uploadfile"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(
        allQuery,
        (snapshot) => {
          const allDocs = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          
          console.log(`Total documents in uploadfile: ${allDocs.length}`);
          
          // Filter for current user and only user-uploaded files
          const userDocs = allDocs
            .map(doc => ({
              ...doc,
              files: (doc.files || []).filter(file => 
                !file.adminUploaded && file.downloadURL // User uploads only
              )
            }))
            .filter(doc => 
              doc.files.length > 0 && (
                doc.customerId === currentUser.uid || 
                doc.customerEmail === currentUser.email ||
                doc.customerUserId === currentUser.uid ||
                doc.createdBy === currentUser.uid
              )
            );
          
          console.log(`Found ${userDocs.length} user-uploaded documents after filtering`);
          setFileDocs(userDocs);
          setLoading(false);
        },
        (error) => {
          console.error("Fallback fetch error:", error);
          setLoading(false);
        }
      );
      
      unsubscribeFunctions.push(unsubscribe);
    };

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, [currentUser, userLoading]);

  // Calculate total files and total size (only user-uploaded)
  const totalFiles = fileDocs.reduce((sum, doc) => sum + (doc.files?.length || 0), 0);
  const totalSize = fileDocs.reduce((sum, doc) => sum + (doc.totalSize || 0), 0);

  // Flatten all files from all documents for display
  const allFiles = fileDocs.flatMap((doc) =>
    (doc.files || []).map((file) => ({
      ...file,
      // Use correct download URL for user uploads
      downloadURL: file.downloadURL,
      parentDocId: doc.id,
      uploadId: doc.uploadId || doc.id,
      uploadDate: file.uploadedAt || doc.createdAt || "Unknown date",
      customerName: doc.customerName || "You",
      customerEmail: doc.customerEmail || currentUser?.email || "Unknown",
      fileSource: "user"
    }))
  );

  console.log("Total user-uploaded files to display:", allFiles.length);

  // Search filter
  const filteredFiles = allFiles.filter((file) => {
    const s = searchTerm.toLowerCase();
    return (
      (file.originalName || "").toLowerCase().includes(s) ||
      (file.status || "").toLowerCase().includes(s) ||
      (file.fileType || "").toLowerCase().includes(s)
    );
  });

  // DOWNLOAD FILE FUNCTION
  const handleDownload = async (file) => {
    const { downloadURL, originalName, fileId } = file;
    
    if (!downloadURL) {
      alert("Download URL not available!");
      return;
    }
    
    setDownloading(prev => ({ ...prev, [fileId]: true }));
    
    try {
      // Create download link
      const link = document.createElement("a");
      link.href = downloadURL; // FIXED: Was downloadURLs
      link.download = originalName || "download";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded: ${originalName}`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading file");
    } finally {
      setTimeout(() => {
        setDownloading(prev => ({ ...prev, [fileId]: false }));
      }, 1000);
    }
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return dateString;
    }
  };

  // FORMAT FILE SIZE
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // GET FILE ICON
  const getFileIcon = (fileType) => {
    if (!fileType) return "📄";
    
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "📕";
    if (type.includes("image")) return "🖼️";
    if (type.includes("video")) return "🎬";
    if (type.includes("audio")) return "🎵";
    if (type.includes("word") || type.includes("doc")) return "📝";
    if (type.includes("excel") || type.includes("xls")) return "📊";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📄";
  };

  // GET STATUS COLOR
  const getStatusColor = (status) => {
    if (!status) return {
      bg: "bg-gray-50",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-800"
    };
    
    const s = status.toLowerCase();
    if (s.includes("complete") || s.includes("success") || s.includes("uploaded")) {
      return {
        bg: "bg-green-50",
        text: "text-green-600",
        badge: "bg-green-100 text-green-800"
      };
    }
    if (s.includes("pending") || s.includes("processing")) {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        badge: "bg-yellow-100 text-yellow-800"
      };
    }
    if (s.includes("error") || s.includes("failed")) {
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        badge: "bg-red-100 text-red-800"
      };
    }
    return {
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-800"
    };
  };

  // LOADING STATE
  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full h-12 w-12 mx-auto"></div>
          <p className="ml-3 text-gray-700 mt-3">Loading your uploaded files...</p>
        </div>
      </div>
    );
  }

  // NOT LOGGED IN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white p-20 text-center rounded-xl border-2 border-dashed">
            <p className="text-gray-500 text-lg mb-4">Please login to view your files</p>
            <p className="text-gray-400">You need to be logged in to access your uploaded files</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Uploads</h1>
          <p className="text-gray-600 mt-2">Files uploaded by you</p>
        </div>
        
        {/* SEARCH BAR */}
         
        {/* STATS */}
        {fileDocs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Upload Sessions</div>
              <div className="text-2xl font-bold text-blue-600">{fileDocs.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Your Uploaded Files</div>
              <div className="text-2xl font-bold text-green-600">{totalFiles}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Total Size</div>
              <div className="text-2xl font-bold text-purple-600">{formatFileSize(totalSize)}</div>
            </div>
          </div>
        )}

        {/* ALL FILES GRID */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? "No files match your search" : "No files uploaded yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try a different search term" 
                : "Upload some files to see them here"}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Uploaded Files ({filteredFiles.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map((file, index) => (
                <div
                  key={`${file.fileId}-${index}`}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {/* File Header */}
                  <div className={`p-5 ${getStatusColor(file.status).bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <span className={`text-lg font-bold ${getStatusColor(file.status).text}`}>
                            {getFileIcon(file.fileType)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 truncate max-w-[180px]" title={file.originalName}>
                            {file.originalName || "Unnamed File"}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {formatDate(file.uploadDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="p-5">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium text-gray-800">
                          {file.fileType?.split('/')[1]?.toUpperCase() || file.fileType || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium text-gray-800">
                          {file.fileSize ? formatFileSize(file.fileSize) : "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Source:</span>
                        <span className="font-medium text-blue-600">
                            You Uploaded
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(file.status).badge}`}>
                          {file.status?.replace(/_/g, " ") || "Unknown Status"}
                        </span>
                        
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloading[file.fileId]}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            downloading[file.fileId]
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          title="Download file"
                        >
                          {downloading[file.fileId] ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Upload Session Info */}
                      <div className="text-xs text-gray-500 mt-2">
                        Upload ID: <span className="font-mono">{file.uploadId?.substring(0, 10)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUploads;