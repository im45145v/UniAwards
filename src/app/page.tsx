import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

const buildQueryString = (params: SearchParams | undefined) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (typeof value === "string") {
      searchParams.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(key, entry));
    }
  });

  return searchParams.toString();
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  if (params && "code" in params) {
    const query = buildQueryString(params);
    redirect(query ? `/auth/callback?${query}` : "/auth/callback");
  }

  redirect("/login");
}
