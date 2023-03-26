migrate((db) => {
  // up
  const admin = new Admin()

  admin.email = process.env.PB_ADMIN_EMAIL
  admin.setPassword(process.env.PB_ADMIN_PASSWORD);

  return Dao(db).saveAdmin(admin)
}, (db) => {
  // down
  const dao = new Dao(db)

const admin = dao.findAdminByEmail(process.env.PB_ADMIN_EMAIL)

  return dao.deleteAdmin(admin)
})
