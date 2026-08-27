import { POST as verifyPostHandler } from '../verify/route'

export async function POST(request: Request) {
  return verifyPostHandler(request)
}
