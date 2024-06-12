import React, { Component } from 'react';
import './Home.css';
import { addDoc, collection, deleteDoc, getDocs, updateDoc, getFirestore } from 'firebase/firestore/lite';
import { app } from './firebase';
import { doc } from 'firebase/firestore/lite';
import UserProfile from './UserProfile';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      currentView: 'home',
      editMode: false,
      editNoteId: null,
      editNoteDescription: '',
      message: '',
      searchText: ''
    };
  }

  async refreshNotes() {
    var notesList = [];
    const db = getFirestore(app);
    const notesCol = collection(db, 'notes');
    const notesSnapshot = await getDocs(notesCol);

    notesSnapshot.forEach(doc => {
      let note = doc.data();
      note.id = doc.id;
      notesList.push(note);
    });
    this.setState({ notes: notesList });
  }

  componentDidMount() {
    this.refreshNotes();
  }

  async addClick() {
    var newNotes = document.getElementById("newNotes").value;
    var newNotesObject = { description: newNotes };
    const db = getFirestore(app);
    const notesCol = collection(db, 'notes');
    await addDoc(notesCol, newNotesObject);

    document.getElementById("newNotes").value = '';

    this.setState({ message: 'Note added successfully!' });
    setTimeout(() => this.setState({ message: '' }), 2000);
    this.refreshNotes();
  }

  async deleteClick(id) {
    const db = getFirestore(app);
    const notesRef = doc(db, 'notes/' + id);
    await deleteDoc(notesRef);
    this.setState({ message: 'Note deleted successfully!' });
    setTimeout(() => this.setState({ message: '' }), 2000);
    this.refreshNotes();
  }

  async updateClick() {
    const { editNoteId, editNoteDescription } = this.state;
    const db = getFirestore(app);
    const noteRef = doc(db, 'notes', editNoteId);
    await updateDoc(noteRef, { description: editNoteDescription });
    this.setState({ message: 'Note updated successfully!', editMode: false, editNoteId: null, editNoteDescription: '' });
    setTimeout(() => this.setState({ message: '' }), 2000);
    this.refreshNotes();
  }

  editClick(note) {
    this.setState({ editMode: true, editNoteId: note.id, editNoteDescription: note.description });
  }

  setView(view) {
    this.setState({ currentView: view });
  }

  async searchNotes(query) {
    await this.setState({ searchText: query });
    this.refreshNotes();
  }

  renderView() 
{
        const { notes, editMode, editNoteDescription, message, searchText } = this.state;
    switch(this.state.currentView){
        case 'home':
    return (
      <div className="content">
        <h2 className='title'>ToDo App</h2>
        {message && <p className='message'>{message}</p>}
        {editMode ? (
          <div className='form'>
            <input
              className='inputField'
              value={editNoteDescription}
              onChange={(e) => this.setState({ editNoteDescription: e.target.value })}
            />
            <button className='button' onClick={() => this.updateClick()}>Update Note</button>
            <button className='button' onClick={() => this.setState({ editMode: false, editNoteId: null, editNoteDescription: '' })}>Cancel</button>
          </div>
        ) : (
          <div className='form'>
            <input className='inputField' id="newNotes" placeholder="Add a new note..." />
            <button className='button' onClick={() => this.addClick()}>Add Note</button>
          </div>
        )}
        <div className='searchSection'>
          <input className='searchField' placeholder='Search notes...' value={searchText} onChange={(e) => this.searchNotes(e.target.value)} />
        </div>
        <div className='notesList'>
          {notes.map(note =>
            note.description.toLowerCase().includes(searchText.toLowerCase()) &&
            <div className='note' key={note.id}>
              <p className='noteDescr'>- {note.description}</p>
              <div className='noteButtons'>
                <button className='editButton' onClick={() => this.editClick(note)}>Edit</button>
                <button className='deleteButton' onClick={() => this.deleteClick(note.id)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
    case 'profile':
          return (
            <UserProfile/>
          );
        case 'contact':
          return (
        <div className="content">
          <h2 className="section-title">Contact Page</h2>
          <p className="section-par">If you have any questions, please contact us at <a href="mailto:todoapp@gmail.com">todoapp@gmail.com</a>.</p>
          <div className="contact-form">
            <input type="text" placeholder="Enter your email" />
            <button className="button" onClick={() => alert("Email sent!")}>Send</button>
          </div>
          <div className="contact-info">
            <h3 className="subsection-title">Follow Us:</h3>
            <div className="social-links">
              <a href="https://www.facebook.com/andreea.cighi" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.instagram.com/andreeacighi/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
            <h3 className="subsection-title">Location:</h3>
            <p>Castanilor 20, Bocsa, Salaj, Romania</p>
          </div>
        </div>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <div className="Home">
        <nav className='navbar'>
          <button className='navButton' onClick={() => this.setView('home')}>Home</button>
          <button className='navButton' onClick={() => this.setView('profile')}>Profile</button>
          <button className='navButton' onClick={() => this.setView('contact')}>Contact</button>
        </nav>
        {this.renderView()}
      </div>
    );
  }
}

export default Home;
