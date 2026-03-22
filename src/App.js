import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container } from 'react-bootstrap';
import EmployeeShiftChange from './EmployeeShiftChange';

function App() {
    return (
        <Container className="py-5">
            <EmployeeShiftChange />
        </Container>
    )
}

export default App;