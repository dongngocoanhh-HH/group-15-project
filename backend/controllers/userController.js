// controllers/userController.js

let users = [
  { id: 1, name: 'Nguyen Van A', email: 'a@example.com' },
  { id: 2, name: 'Tran Thi B', email: 'b@example.com' }
];

let nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

exports.getUsers = (req, res) => {
  res.json({ success: true, data: users });
};

exports.createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'name và email là bắt buộc' });
  }

  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email đã tồn tại' });
  }

  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
};

exports._getRawUsers = () => users;
