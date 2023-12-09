import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom"
import { getContacts, saveContact, updatePhoto } from './api/ContactService';
import { toastError, toastSuccess } from './api/ToastService';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Header from './components/Header';
import ContactList from './components/ContactList';
import ContactDetail from './components/ContactDetail';

const App = () => {
  const modalRef = useRef();
  const fileRef = useRef();
  const [data, setData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [file, setFile] = useState(undefined);
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    title: '',
    status: '',
  });

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  const getAllContacts = async (page = 0, size = 12) => {
    try {
      setCurrentPage(page);
      const { data } = await getContacts(page, size);
      setData(data);
      console.log(data);
      // toastSuccess(data?.content?.length > 0 ? 'Conacts retrived' : 'No contacts found');
    } catch (error) {
      console.log(error);
      toastError(error.message);
     }
  };

  const handleNewContact = async (event) => {
    event.preventDefault();
    try {
      const { data } = await saveContact(values);
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('id', data.id);
      const { data: photoUrl } = await updatePhoto(formData);
      //setData((prev) => ({ ...prev, totalElements: prev.totalElements + 1, content: [{ ...data, photoUrl }, ...prev.content] }));
      toggleModal(false);
      console.log(data);
      setValues({
        name: '',
        email: '',
        phone: '',
        address: '',
        title: '',
        status: ''
      });
      setFile(undefined);
      fileRef.current.value = null;
      toastSuccess('Contact created');
      getAllContacts();
    } catch (error) {
      console.log(error);
      toastError(error.message);
    }
  };

  const updateContact = async (contact) => {
      try {
          const { data } = await saveContact(contact);
          setData((prev) => {
            prev.content[prev.content.findIndex((contact => contact.id === data.id))] = data;
            return { ...prev, content: [...prev.content] };
          });
          console.log(data);
          toastSuccess('Contact updated');
      } catch (error) {
        console.log(error);
          toastError(error.message);
       }
  };

  const updateImage = async (formData) => {
    try {
        const { data: photoUrl } = await updatePhoto(formData);
        const contactIndex = data.content.findIndex((contact => contact.id === formData.get('id')));
        const updatedContact = data.content[contactIndex];
        updatedContact.photoUrl = `${photoUrl}?time=${new Date().getTime()}`;
        setData((prev) => {
          prev.content[contactIndex] = updatedContact;
          return { ...prev, content: [...prev.content] };
        });
        console.log(data)
        toastSuccess('Photo updated');
    } catch (error) {
        toastError(error.message);
     }
};

  const toggleModal = (show) => show ? modalRef.current.showModal() : modalRef.current.close();

  useEffect(() => {
    getAllContacts();
  }, []);

  return (
    <>
      <Header toggleModal={toggleModal} nbOfContacts={data.totalElements} />
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to={'/contacts'} />} />
            <Route path="/contacts" element={<ContactList data={data} currentPage={currentPage} getAllContacts={getAllContacts} />} />
            <Route path="/contacts/:id" element={<ContactDetail updateContact={updateContact} updateImage={updateImage} />} />
          </Routes>
        </div>
      </main>

      {/* Modal */}
      <dialog ref={modalRef} className="modal" id="modal">
        <div className="modal__header">
          <h3>New Contact</h3>
          <i onClick={() => toggleModal(false)} className="bi bi-x-lg"></i>
        </div>
        <div className="divider"></div>
        <div className="modal__body">
          <form onSubmit={handleNewContact}>
            <div className="user-details">
              <div className="input-box">
                <span className="details">Name</span>
                <input type="text" value={values.name} onChange={onChange} name='name' required />
              </div>
              <div className="input-box">
                <span className="details">Email</span>
                <input type="text" value={values.email} onChange={onChange} name='email' required />
              </div>
              <div className="input-box">
                <span className="details">Title</span>
                <input type="text" value={values.title} onChange={onChange} name='title' required />
              </div>
              <div className="input-box">
                <span className="details">Phone Number</span>
                <input type="text" value={values.phone} onChange={onChange} name='phone' required />
              </div>
              <div className="input-box">
                <span className="details">Address</span>
                <input type="text" value={values.address} onChange={onChange} name='address' required />
              </div>
              <div className="input-box">
                <span className="details">Account Status</span>
                <input type="text" value={values.status} onChange={onChange} name='status' required />
              </div>
              <div className="file-input">
                <span className="details">Profile Photo</span>
                <input type="file" onChange={(event) => setFile(event.target.files[0])} name='photo' ref={fileRef} required />
              </div>
            </div>
            <div className="form_footer">
              <button type='button' onClick={() => toggleModal(false)} className="btn btn-danger">Cancel</button>
              <button type='submit' className="btn">Save</button>
            </div>
          </form>
        </div>
      </dialog>
      <ToastContainer />
    </>
  );
}

export default App;
