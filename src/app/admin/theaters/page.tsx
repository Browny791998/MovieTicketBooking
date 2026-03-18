import TheatersClient from "./TheatersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminTheatersPage() {
    return <TheatersClient />;
}
