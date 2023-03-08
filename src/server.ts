import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

app.get('/', () => {
  return "nodedeploy is up!"
})

app.get('/users', async () => {
  const users = await prisma.user.findMany()
  return { users }
})

app.get('/users/:id', async (req, res) => {
  const getUserSchema = z.object({
    id: z.string().cuid()
  })

  const { id } = getUserSchema.parse(req.params)
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) return res.status(404).send({ message: 'User not found' })
  return { user }
})

app.post('/users', async (req, res) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  })

  const { name, email } = createUserSchema.parse(req.body)
  await prisma.user.create({
    data: {
      name,
      email,
    }
  })

  return res.status(201).send()
})

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => console.log('HTTP Server running!'))