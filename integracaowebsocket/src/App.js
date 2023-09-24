import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Button,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
} from '@mui/material';

const URL = 'http://localhost:8080';

const socket = io(URL, {
  autoConnect: false,
});

export default function App() {
  const [login, setLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState({});
  const [newUser, setNewUser] = useState('');
  const [isShowingNewUserAlert, setIsShowingNewUserAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receiveNewUser', (newUserName, updatedUsers) => {
      setUsers(updatedUsers);
      setNewUser(newUserName);

      if (socket.auth.username !== newUserName) {
        setIsShowingNewUserAlert(true);
      }
    });
  }, [users]);

  useEffect(() => {
    socket.on('receiveMessage', (id, sender, socketId, message) => {
      setMessages([
        ...messages,
        { id, username: sender, userId: socketId, text: message },
      ]);
    });
  }, [messages]);

  function connect() {
    socket.auth = { username: username };
    socket.connect();
    setLogin(false);
  }

  function disconnect() {
    const shouldDisconnect = window.confirm(
      'Tem certeza de que deseja sair do chat?',
    );

    if (shouldDisconnect) {
      setUsername('');
      setNewUser('');
      setUsers({});
      setMessages([]);
      setMessage('');
      setIsShowingNewUserAlert(false);
      socket.disconnect();
      setLogin(true);
    }
  }

  function sendMessage() {
    socket.emit('sendMessage', message);
    setMessage('');
  }

  return (
    <Grid item container direction="column" alignContent="center">
      <Grid item>
        <h2>
          Awesome Chat{' '}
          {Object.keys(users).length > 0
            ? `(${Object.keys(users).length} online)`
            : ''}
        </h2>
      </Grid>

      <Grid item style={{ width: '70%' }}>
        {login ? (
          <Grid item container spacing={2}>
            <Grid item>
              <TextField
                size="small"
                placeholder="Digite o seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>

            <Grid item>
              <Button onClick={connect}>Conectar</Button>
            </Grid>
          </Grid>
        ) : (
          <Grid
            item
            container
            direction="column"
            spacing={2}
            style={{ width: '70%' }}
          >
            <Grid item>
              <Paper
                style={{
                  overflowY: 'auto',
                  minHeight: '70vh',
                  maxHeight: '70vh',
                }}
              >
                <List>
                  {messages.map((message) => {
                    return (
                      <ListItemButton key={message.id} autoFocus={true} divider>
                        {message.userId === socket.id ? (
                          <ListItemText style={{ color: 'blue' }}>
                            Me: {message.text}
                          </ListItemText>
                        ) : (
                          <ListItemText
                            style={{ color: 'green' }}
                          >{`${message.username}: ${message.text}`}</ListItemText>
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Paper>
            </Grid>

            <Grid item container spacing={2}>
              <Grid item>
                <TextField
                  placeholder="Digite uma messagem"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item>
                <Button variant="outlined" onClick={sendMessage}>
                  Enviar
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={disconnect}>
                  Sair
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={isShowingNewUserAlert}
        autoHideDuration={3000}
        onClose={() => setIsShowingNewUserAlert(false)}
        message={`${newUser} entrou no chat!`}
      />
    </Grid>
  );
}
