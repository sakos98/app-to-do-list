import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:3000'); 
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  const removeTask = useCallback(
    (taskId, isLocal = true) => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      if (socket && isLocal) {
        socket.emit('removeTask', taskId);
      }
    },
    [socket]
  );

  useEffect(() => {
    if (socket) {
      socket.on('addTask', (newTask) => {
        console.log('addTask:', newTask);
        setTasks(prevTasks => {
          if (!prevTasks.some(task => task.id === newTask.id)) {
            return [...prevTasks, newTask];
          }
          return prevTasks;
        });
      });

      socket.on('removeTask', (taskId) => {
        console.log('removeTask:', taskId);
        removeTask(taskId, false);
      });
    }
  }, [socket, removeTask]);

  const submitForm = (event) => {
    event.preventDefault();
    const trimmedTaskName = taskName.trim();
    if (!trimmedTaskName) {
      return; 
    }

    const taskId = uuidv4();
    const newTask = { id: taskId, name: trimmedTaskName };
    setTasks(tasks => [...tasks, newTask]);
    if (socket) {
      socket.emit('addTask', newTask);
    }
    setTaskName('');
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>
      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>
        <ul className="tasks-section__list" id="tasks-list">
        {tasks.map(task => (
          <li className="task" key={task.id}>
              {task.name}
            <div className="button-group">
                <>
                  <button className="btn btn--red" onClick={() => removeTask(task.id)}>
                    Remove
                  </button>
                </>
            </div>
          </li>
        ))}
      </ul>
        <form id="add-task-form" onSubmit={submitForm}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
          />
          <button className="btn" type="submit">Add</button>
        </form>
      </section>
    </div>
  );
}

export default App;