import React, { Component } from 'react';
import { auth, storage } from './firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import './UserProfile.css';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      uploadProgress: 0,
      selectedImage: null,
      currentPassword: '',
      newPassword: '',
      passwordChangeMessage: ''
    };
  }

  componentDidMount() {
    // Ascultă schimbările de autentificare
    this.unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // User-ul este autentificat
        this.setState({ user: user });
      } else {
        // User-ul nu este autentificat
        this.setState({ user: null });
      }
    });
  }

  componentWillUnmount() {
    // Anulează ascultarea pentru schimbările de autentificare
    this.unsubscribe();
  }

  handleLogout = async () => {
    try {
      await auth.signOut();
      // Redirecționează către pagina de login
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      this.setState({ selectedImage: URL.createObjectURL(file) });
      this.uploadFile(file);
    }
  };

  uploadFile = (file) => {
    const { user } = this.state;
    if (!user) return;

    const storageRef = ref(storage, `profile_pictures/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Progress function
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({ uploadProgress: progress });
      }, 
      (error) => {
        // Error function
        console.error('Error uploading file:', error.message);
      }, 
      () => {
        // Complete function
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          this.updateUserProfile(downloadURL);
        });
      }
    );
  };

  updateUserProfile = (photoURL) => {
    const { user } = this.state;
    if (user) {
      updateProfile(user, { photoURL })
        .then(() => {
          this.setState({ user: { ...user, photoURL } });
        })
        .catch(error => {
          console.error('Error updating profile:', error.message);
        });
    }
  };

  handlePasswordChange = async (e) => {
    e.preventDefault();
    const { user, currentPassword, newPassword } = this.state;

    if (user && currentPassword && newPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        this.setState({ passwordChangeMessage: 'Password updated successfully!', currentPassword: '', newPassword: '' });
      } catch (error) {
        this.setState({ passwordChangeMessage: `Error updating password: ${error.message}` });
      }
    }
  };

  render() {
    const { user, uploadProgress,  currentPassword, newPassword, passwordChangeMessage } = this.state;
    return (
      <div className="profile-container">
        {user ? (
          <div>
            <div className="profile-pic">
              <img src={user.photoURL || 'https://via.placeholder.com/100'} alt="Profile" className="profile-pic-img"/>
            </div>
            <input type="file" onChange={this.handleFileChange} />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <p>Uploading: {Math.round(uploadProgress)}%</p>
            )}
            <div className="profile-detail">
              <p>Email: {user.email}</p>
              <p>ID: {user.uid}</p>
              {/* Alte informații despre utilizator pe care dorești să le afișezi */}
            </div>

            <form onSubmit={this.handlePasswordChange} className="password-form">
              <h3>Change Password</h3>
              <input 
                type="password" 
                placeholder="Current Password" 
                value={currentPassword} 
                onChange={(e) => this.setState({ currentPassword: e.target.value })} 
                required 
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => this.setState({ newPassword: e.target.value })} 
                required 
              />
              <button type="submit">Change Password</button>
              {passwordChangeMessage && <p>{passwordChangeMessage}</p>}
            </form>

            <button className="logout-button" onClick={this.handleLogout}>Logout</button>
          </div>
        ):(
            <p>Utilizatorul nu este autentificat.<a href="/login" className="auth-link">Autentificare</a></p>
          )}
      </div>
    );
  }
}

export default UserProfile;
