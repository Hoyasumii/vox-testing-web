const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'mock-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let users = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao@doctor.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    type: 'DOCTOR'
  },
  {
    id: '2',
    name: 'Dra. Maria Santos',
    email: 'maria@doctor.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    type: 'DOCTOR'
  },
  {
    id: '3',
    name: 'Carlos Paciente',
    email: 'carlos@patient.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    type: 'PATIENT'
  }
];

let availabilities = [
  {
    id: 'av1',
    doctorId: '1',
    date: '2025-08-22',
    startTime: '08:00',
    endTime: '12:00',
    slotMinutes: 30,
    slots: [
      { time: '08:00', available: true },
      { time: '08:30', available: true },
      { time: '09:00', available: false },
      { time: '09:30', available: true },
      { time: '10:00', available: true },
      { time: '10:30', available: false },
      { time: '11:00', available: true },
      { time: '11:30', available: true }
    ]
  },
  {
    id: 'av2',
    doctorId: '2',
    date: '2025-08-22',
    startTime: '14:00',
    endTime: '18:00',
    slotMinutes: 30,
    slots: [
      { time: '14:00', available: true },
      { time: '14:30', available: true },
      { time: '15:00', available: true },
      { time: '15:30', available: false },
      { time: '16:00', available: true },
      { time: '16:30', available: true },
      { time: '17:00', available: false },
      { time: '17:30', available: true }
    ]
  }
];

let schedules = [
  {
    id: 's1',
    doctorId: '1',
    patientId: '3',
    date: '2025-08-22',
    slotTime: '09:00',
    status: 'SCHEDULED',
    notes: '',
    createdAt: new Date().toISOString()
  }
];

// Middleware para autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = users.find(u => u.id === decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Mock API is running' });
});

// Auth routes
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não encontrado' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Senha incorreta' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    }
  });
});

app.post('/auth/new', async (req, res) => {
  const { name, email, password, type } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, error: 'Email já está em uso' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password: hashedPassword,
    type
  };

  users.push(newUser);
  
  res.json({ success: true, data: 'Usuário criado com sucesso' });
});

// User routes
app.get('/users/me', authenticate, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ success: true, data: userWithoutPassword });
});

app.get('/users/doctors', authenticate, (req, res) => {
  const doctors = users
    .filter(u => u.type === 'DOCTOR')
    .map(({ password: _, ...doctor }) => ({
      ...doctor,
      availabilityCount: availabilities.filter(av => av.doctorId === doctor.id).length
    }));
  
  res.json({ success: true, data: doctors });
});

// Availability routes
app.get('/availability/my', authenticate, (req, res) => {
  if (req.user.type !== 'DOCTOR') {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }

  const myAvailabilities = availabilities.filter(av => av.doctorId === req.user.id);
  res.json({ success: true, data: myAvailabilities });
});

app.get('/availability/doctor/:doctorId', authenticate, (req, res) => {
  const { doctorId } = req.params;
  const doctorAvailabilities = availabilities.filter(av => av.doctorId === doctorId);
  res.json({ success: true, data: doctorAvailabilities });
});

app.post('/availability', authenticate, (req, res) => {
  if (req.user.type !== 'DOCTOR') {
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  }

  const { date, startTime, endTime, slotMinutes } = req.body;
  
  const newAvailability = {
    id: `av${availabilities.length + 1}`,
    doctorId: req.user.id,
    date,
    startTime,
    endTime,
    slotMinutes: slotMinutes || 30,
    slots: generateTimeSlots(startTime, endTime, slotMinutes || 30)
  };

  availabilities.push(newAvailability);
  res.json({ success: true, data: newAvailability });
});

app.put('/availability/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const availability = availabilities.find(av => av.id === id && av.doctorId === req.user.id);
  
  if (!availability) {
    return res.status(404).json({ success: false, error: 'Disponibilidade não encontrada' });
  }

  Object.assign(availability, req.body);
  res.json({ success: true, data: availability });
});

app.delete('/availability/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const index = availabilities.findIndex(av => av.id === id && av.doctorId === req.user.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Disponibilidade não encontrada' });
  }

  availabilities.splice(index, 1);
  res.json({ success: true, data: true });
});

// Schedule routes
app.get('/schedules/my', authenticate, (req, res) => {
  let mySchedules;
  
  if (req.user.type === 'DOCTOR') {
    mySchedules = schedules.filter(s => s.doctorId === req.user.id);
  } else {
    mySchedules = schedules.filter(s => s.patientId === req.user.id);
  }
  
  res.json({ success: true, data: mySchedules });
});

app.post('/schedules', authenticate, (req, res) => {
  const { doctorId, date, slotTime, notes } = req.body;
  
  // Check if slot is available
  const availability = availabilities.find(av => 
    av.doctorId === doctorId && 
    av.date === date
  );
  
  if (!availability) {
    return res.status(400).json({ success: false, error: 'Horário não disponível' });
  }

  const slot = availability.slots.find(s => s.time === slotTime && s.available);
  if (!slot) {
    return res.status(400).json({ success: false, error: 'Horário já ocupado' });
  }

  // Mark slot as unavailable
  slot.available = false;

  // Create schedule
  const newSchedule = {
    id: `s${schedules.length + 1}`,
    doctorId,
    patientId: req.user.id,
    date,
    slotTime,
    status: 'SCHEDULED',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  schedules.push(newSchedule);
  res.json({ success: true, data: newSchedule });
});

app.put('/schedules/:id/cancel', authenticate, (req, res) => {
  const { id } = req.params;
  const schedule = schedules.find(s => 
    s.id === id && 
    (s.doctorId === req.user.id || s.patientId === req.user.id)
  );
  
  if (!schedule) {
    return res.status(404).json({ success: false, error: 'Consulta não encontrada' });
  }

  schedule.status = 'CANCELLED';
  
  // Make slot available again
  const availability = availabilities.find(av => 
    av.doctorId === schedule.doctorId && 
    av.date === schedule.date
  );
  
  if (availability) {
    const slot = availability.slots.find(s => s.time === schedule.slotTime);
    if (slot) slot.available = true;
  }

  res.json({ success: true, data: schedule });
});

app.put('/schedules/:id/complete', authenticate, (req, res) => {
  const { id } = req.params;
  const schedule = schedules.find(s => 
    s.id === id && 
    s.doctorId === req.user.id
  );
  
  if (!schedule) {
    return res.status(404).json({ success: false, error: 'Consulta não encontrada' });
  }

  schedule.status = 'COMPLETED';
  res.json({ success: true, data: schedule });
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, slotMinutes) {
  const slots = [];
  const start = new Date(`2025-01-01 ${startTime}`);
  const end = new Date(`2025-01-01 ${endTime}`);
  
  let current = new Date(start);
  
  while (current < end) {
    slots.push({
      time: current.toTimeString().slice(0, 5),
      available: true
    });
    current.setMinutes(current.getMinutes() + slotMinutes);
  }
  
  return slots;
}

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /auth - Login');
  console.log('  POST /auth/new - Register');
  console.log('  GET /users/me - Get current user');
  console.log('  GET /users/doctors - List doctors');
  console.log('  GET /availability/my - My availability (doctors only)');
  console.log('  GET /availability/doctor/:doctorId - Doctor availability');
  console.log('  POST /availability - Create availability (doctors only)');
  console.log('  GET /schedules/my - My schedules');
  console.log('  POST /schedules - Create schedule');
  console.log('  PUT /schedules/:id/cancel - Cancel schedule');
  console.log('  PUT /schedules/:id/complete - Complete schedule (doctors only)');
});
