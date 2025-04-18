import TowerOfHanoi from "@/components/tower-of-hanoi"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <TowerOfHanoi />
    </main>
  )
}
