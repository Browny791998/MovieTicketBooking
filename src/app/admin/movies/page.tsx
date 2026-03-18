import MoviesClient from "./MoviesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminMoviesPage() {
    return <MoviesClient />;
}
