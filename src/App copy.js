import { useState } from 'react';
import axios from 'axios';

const APIT_URL = 'http://localhost:8080/file';

const App = () => {
  const [files, setFiles] = useState(undefined);
  const [progress, setProgress] = useState({ status: null, percent: 0 });

  const uploadFiles = () => {
    if (!files) { alert('please choose a file'); return; }
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    axios.post(`${APIT_URL}/upload`, formData, { onUploadProgress: updateProgress })
      .then(response => {
        console.log(response);
        setFiles(undefined);
        setProgress(prev => { return { ...prev, status: 'done', percent: 0 } });
      })
      .catch(console.log)
  };

  const downloadFiles = (filename) => {
    axios.get(`${APIT_URL}/download/${filename}`, { responseType: 'blob', onDownloadProgress: updateProgress })
      .then(response => {
        console.log(response);
        const url = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.headers.get('file-name'));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        //URL.revokeObjectURL(href);
      })
      .catch(console.log)
  };

  const updateProgress = (progressEvent) => {
    console.log(progressEvent);
    setProgress(prev => { return { ...prev, status: 'started', percent: progressEvent.progress * 100 } });
  };

  return (
    <div className="App">
      <h1>Upload files</h1>
      <input type='file' onChange={(event) => { setFiles(event.target.files) }} multiple /> <br></br>
      <button onClick={uploadFiles}>upload files</button> <br></br>
      <button onClick={() => downloadFiles('youtubefree.mp4')}>download files</button> <br></br>

      {(progress.percent > 0 && progress.percent !== 0) && <p>Progress: {Math.round(progress.percent)}%</p>}
      {progress.status === 'started' && <progress max="100" value={progress.percent}></progress>}
    </div>
  );
}

export default App;
