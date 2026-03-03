export type OfferRowVM = {
  id: string;
  title: string;
  image_url: string | null;
  user: string;
  status: string;
  created_at: string;
};

export function mapInquiryToOfferRowVM(x: any): OfferRowVM {
  const imageUrl =
    x?.product?.images?.find((i: any) => i?.is_primary)?.url ??
    x?.product?.images?.[0]?.url ??
    null;

  return {
    id: x.id,
    title: x?.product?.name ?? '—',
    image_url: imageUrl,
    user: x?.user?.full_name ?? x?.user?.email ?? '—',
    status: x?.status ?? 'pending',
    created_at: x?.created_at ?? '',
  };
}

export function mapInquiriesToOfferRowsVM(list: any[]): OfferRowVM[] {
  return (list ?? []).map(mapInquiryToOfferRowVM);
}