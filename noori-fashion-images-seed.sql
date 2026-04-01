-- =============================================
-- PRODUCT IMAGES SEED
-- Run this AFTER uploading images to Supabase Storage bucket 'noori-fashion'
-- Images extracted from the client's DOCX file
-- =============================================

-- Product 1: Exclusive Indian Palazzo (images 1-5)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image1.jpeg', 0, true FROM public.nf_products WHERE slug = 'exclusive-indian-palazzo-1';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image2.jpeg', 1, false FROM public.nf_products WHERE slug = 'exclusive-indian-palazzo-1';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image3.jpeg', 2, false FROM public.nf_products WHERE slug = 'exclusive-indian-palazzo-1';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image4.jpeg', 3, false FROM public.nf_products WHERE slug = 'exclusive-indian-palazzo-1';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image5.jpeg', 4, false FROM public.nf_products WHERE slug = 'exclusive-indian-palazzo-1';

-- Product 2: Designer Three Pieces (image 6)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image6.jpeg', 0, true FROM public.nf_products WHERE slug = 'designer-three-pieces';

-- Product 3: Premium Boutique Palazzo (images 7-8)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image7.jpeg', 0, true FROM public.nf_products WHERE slug = 'premium-boutique-palazzo';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image8.jpeg', 1, false FROM public.nf_products WHERE slug = 'premium-boutique-palazzo';

-- Product 4: Readymade Coat Set (images 9-12)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image9.jpeg', 0, true FROM public.nf_products WHERE slug = 'readymade-co-ord-set';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image10.jpeg', 1, false FROM public.nf_products WHERE slug = 'readymade-co-ord-set';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image11.jpeg', 2, false FROM public.nf_products WHERE slug = 'readymade-co-ord-set';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image12.jpeg', 3, false FROM public.nf_products WHERE slug = 'readymade-co-ord-set';

-- Product 5: Readymade Three Pieces (images 13-14)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image13.jpeg', 0, true FROM public.nf_products WHERE slug = 'readymade-three-pieces-1';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image14.jpeg', 1, false FROM public.nf_products WHERE slug = 'readymade-three-pieces-1';

-- Product 6 (reuse of 5 template): Trendy Three Pieces (image 15)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image15.jpeg', 0, true FROM public.nf_products WHERE slug = 'trendy-three-pieces';

-- Product 7: Classic Three Pieces (images 16-17)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image16.jpeg', 0, true FROM public.nf_products WHERE slug = 'classic-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image17.jpeg', 1, false FROM public.nf_products WHERE slug = 'classic-three-pieces';

-- Product 8: (mapped to Trendy) extra images (18-19)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image18.jpeg', 1, false FROM public.nf_products WHERE slug = 'trendy-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image19.jpeg', 2, false FROM public.nf_products WHERE slug = 'trendy-three-pieces';

-- Product 9: Elegant Three Pieces (images 20-21)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image20.jpeg', 0, true FROM public.nf_products WHERE slug = 'elegant-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image21.jpeg', 1, false FROM public.nf_products WHERE slug = 'elegant-three-pieces';

-- Product 10: Unstitched Three Pieces (images 22-30)
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image22.jpeg', 0, true FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image23.jpeg', 1, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image24.jpeg', 2, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image25.jpeg', 3, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image26.jpeg', 4, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image27.jpeg', 5, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image28.jpeg', 6, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image29.jpeg', 7, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
INSERT INTO public.nf_product_images (product_id, url, sort_order, is_primary) 
SELECT id, 'products/image30.jpeg', 8, false FROM public.nf_products WHERE slug = 'unstitched-three-pieces';
