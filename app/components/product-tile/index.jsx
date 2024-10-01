/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, useRef} from 'react'
import PropTypes from 'prop-types'
import {HeartIcon, HeartSolidIcon} from '@salesforce/retail-react-app/app/components/icons'

// Components
import {
    AspectRatio,
    Box,
    Button,
    Skeleton as ChakraSkeleton,
    Text,
    Stack,
    useMultiStyleConfig,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter
} from '@salesforce/retail-react-app/app/components/shared/ui'

import { useProduct, useShopperBasketsMutation } from '@salesforce/commerce-sdk-react'

import DynamicImage from '@salesforce/retail-react-app/app/components/dynamic-image'

// Hooks
import {useIntl} from 'react-intl'
import useEinstein from '@salesforce/retail-react-app/app/hooks/use-einstein'
import {useCurrentBasket} from '@salesforce/retail-react-app/app/hooks/use-current-basket'
import {useToast} from '@salesforce/retail-react-app/app/hooks/use-toast'

// Other
import {productUrlBuilder} from '@salesforce/retail-react-app/app/utils/url'
import Link from '@salesforce/retail-react-app/app/components/link'
import withRegistration from '@salesforce/retail-react-app/app/components/with-registration'
import {useCurrency} from '@salesforce/retail-react-app/app/hooks'
import ProductView from '@salesforce/retail-react-app/app/components/product-view'
import {useWishList} from '@salesforce/retail-react-app/app/hooks/use-wish-list'


const IconButtonWithRegistration = withRegistration(IconButton)

// Component Skeleton
export const Skeleton = () => {
    const styles = useMultiStyleConfig('ProductTile')
    return (
        <Box data-testid="sf-product-tile-skeleton">
            <Stack spacing={2}>
                <Box {...styles.imageWrapper}>
                    <AspectRatio ratio={1} {...styles.image}>
                        <ChakraSkeleton />
                    </AspectRatio>
                </Box>
                <ChakraSkeleton width="80px" height="20px" />
                <ChakraSkeleton width={{base: '120px', md: '220px'}} height="12px" />
            </Stack>
        </Box>
    )
}

/**
 * The ProductTile is a simple visual representation of a
 * product object. It will show it's default image, name and price.
 * It also supports favourite products, controlled by a heart icon.
 */
const ProductTile = (props) => {
    const intl = useIntl()
    const {
        product,
        enableFavourite = false,
        isFavourite,
        onFavouriteToggle,
        dynamicImageProps,
        ...rest
    } = props

    const {currency, image, price, productId, hitType} = product

    // ProductTile is used by two components, RecommendedProducts and ProductList.
    // RecommendedProducts provides a localized product name as `name` and non-localized product
    // name as `productName`. ProductList provides a localized name as `productName` and does not
    // use the `name` property.
    const localizedProductName = product.name ?? product.productName

    const {data: basket} = useCurrentBasket()
    const isBasketLoading = !basket?.basketId
    const addItemToBasketMutation = useShopperBasketsMutation('addItemToBasket')

    const showToast = useToast()
    const showError = () => {
        showToast({
            title: formatMessage(API_ERROR_MESSAGE),
            status: 'error'
        })
    }

    const {currency: activeCurrency} = useCurrency()
    const isFavouriteLoading = useRef(false)
    const styles = useMultiStyleConfig('ProductTile')
    const einstein = useEinstein()
    const {data: wishlist, isLoading: isWishlistLoading} = useWishList()

    const [isModalOpen, setIsModalOpen] = useState(false);
    const closeModal =  (e) => {
        setIsModalOpen(false);
    }
    const openModal =  (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    }

    const {
        data: products,
        isLoading: isProductLoading,
        isError: isProductError,
        error: productError
    } = useProduct(
        {
            parameters: {
                id: productId,
                allImages: true
            }
        },
        {
            // When shoppers select a different variant (and the app fetches the new data),
            // the old data is still rendered (and not the skeletons).
            keepPreviousData: true
        }
    )

    const handleAddToCart = async (productSelectionValues) => {
        try {
            const productItems = productSelectionValues.map(({variant, quantity}) => ({
                productId: variant.productId,
                price: variant.price,
                quantity
            }))

            await addItemToBasketMutation.mutateAsync({
                parameters: {basketId: basket.basketId},
                body: productItems
            })

            einstein.sendAddToCart(productItems)

            // If the items were successfully added, set the return value to be used
            // by the add to cart modal.
            return productSelectionValues
        } catch (error) {
            showError(error)
        }
    }

    const handleAddToWishlist = (product, variant, quantity) => {
        const isItemInWishlist = wishlist?.customerProductListItems?.find(
            (i) => i.productId === variant?.productId || i.productId === product?.id
        )

        if (!isItemInWishlist) {
            createCustomerProductListItem.mutate(
                {
                    parameters: {
                        listId: wishlist.id,
                        customerId
                    },
                    body: {
                        // NOTE: APi does not respect quantity, it always adds 1
                        quantity,
                        productId: variant?.productId || product?.id,
                        public: false,
                        priority: 1,
                        type: 'product'
                    }
                },
                {
                    onSuccess: () => {
                        toast({
                            title: formatMessage(TOAST_MESSAGE_ADDED_TO_WISHLIST, {quantity: 1}),
                            status: 'success',
                            action: (
                                // it would be better if we could use <Button as={Link}>
                                // but unfortunately the Link component is not compatible
                                // with Chakra Toast, since the ToastManager is rendered via portal
                                // and the toast doesn't have access to intl provider, which is a
                                // requirement of the Link component.
                                <Button
                                    variant="link"
                                    onClick={() => navigate('/account/wishlist')}
                                >
                                    {formatMessage(TOAST_ACTION_VIEW_WISHLIST)}
                                </Button>
                            )
                        })
                    },
                    onError: () => {
                        showError()
                    }
                }
            )
        } else {
            toast({
                title: formatMessage(TOAST_MESSAGE_ALREADY_IN_WISHLIST),
                status: 'info',
                action: (
                    <Button variant="link" onClick={() => navigate('/account/wishlist')}>
                        {formatMessage(TOAST_ACTION_VIEW_WISHLIST)}
                    </Button>
                )
            })
        }
    }

    return (
        <Box {...styles.container}>
            <Link
                data-testid="product-tile"
                to={productUrlBuilder({ id: productId }, intl.local)}
                {...styles.link}
                {...rest}
            >
                <Box {...styles.imageWrapper} position="relative" role="group">
                    {image && (
                        <AspectRatio {...styles.image}>
                            <DynamicImage
                                src={`${image.disBaseLink || image.link}[?sw={width}&q=60]`}
                                widths={dynamicImageProps?.widths}
                                imageProps={{
                                    alt: image.alt,
                                    ...dynamicImageProps?.imageProps
                                }}
                            />
                        </AspectRatio>
                    )}

                    {/* Button that appears on hover */}
                    <Box
                        position="absolute"
                        bottom="10px"
                        left="50%"
                        transform="translateX(-50%)"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                    >
                        <Button colorScheme="blue" onClick={openModal}>
                            Quick view
                        </Button>
                    </Box>
                </Box>

                {/* Title */}
                <Text {...styles.title}>{localizedProductName}</Text>

                {/* Price */}
                <Text {...styles.price} data-testid="product-tile-price">
                    {hitType === 'set'
                        ? intl.formatMessage(
                            {
                                id: 'product_tile.label.starting_at_price',
                                defaultMessage: 'Starting at {price}'
                            },
                            {
                                price: intl.formatNumber(price, {
                                    style: 'currency',
                                    currency: currency || activeCurrency
                                })
                            }
                        )
                        : intl.formatNumber(price, {
                            style: 'currency',
                            currency: currency || activeCurrency
                        })}
                </Text>
            </Link>

            {enableFavourite && (
                <Box
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    <IconButtonWithRegistration
                        data-testid="wishlist-button"
                        aria-label={
                            isFavourite
                                ? intl.formatMessage(
                                    {
                                        id: 'product_tile.assistive_msg.remove_from_wishlist',
                                        defaultMessage: 'Remove {product} from wishlist'
                                    },
                                    { product: localizedProductName }
                                )
                                : intl.formatMessage(
                                    {
                                        id: 'product_tile.assistive_msg.add_to_wishlist',
                                        defaultMessage: 'Add {product} to wishlist'
                                    },
                                    { product: localizedProductName }
                                )
                        }
                        icon={isFavourite ? <HeartSolidIcon /> : <HeartIcon />}
                        {...styles.favIcon}
                        onClick={async () => {
                            if (!isFavouriteLoading.current) {
                                isFavouriteLoading.current = true;
                                await onFavouriteToggle(!isFavourite);
                                isFavouriteLoading.current = false;
                            }
                        }}
                    />
                </Box>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} size="5xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{localizedProductName}</ModalHeader>
                    <ModalCloseButton onClick={closeModal}/>
                    <ModalBody>
                        <ProductView product={products}
                        addToCart={(variant, quantity) =>
                            handleAddToCart([{product, variant, quantity}])
                        }
                        addToWishlist={handleAddToWishlist}
                        isProductLoading={isProductLoading}
                        isBasketLoading={isBasketLoading}
                        isWishlistLoading={isWishlistLoading}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={closeModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    )
}

ProductTile.displayName = 'ProductTile'

ProductTile.propTypes = {
    /**
     * The product search hit that will be represented in this
     * component.
     */
    product: PropTypes.shape({
        currency: PropTypes.string,
        image: PropTypes.shape({
            alt: PropTypes.string,
            disBaseLink: PropTypes.string,
            link: PropTypes.string
        }),
        price: PropTypes.number,
        // `name` is present and localized when `product` is provided by a RecommendedProducts component
        // (from Shopper Products `getProducts` endpoint), but is not present when `product` is
        // provided by a ProductList component.
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products?meta=getProducts
        name: PropTypes.string,
        // `productName` is localized when provided by a ProductList component (from Shopper Search
        // `productSearch` endpoint), but is NOT localized when provided by a RecommendedProducts
        // component (from Einstein Recommendations `getRecommendations` endpoint).
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch
        // See: https://developer.salesforce.com/docs/commerce/einstein-api/references/einstein-api-quick-start-guide?meta=getRecommendations
        // Note: useEinstein() transforms snake_case property names from the API response to camelCase
        productName: PropTypes.string,
        productId: PropTypes.string,
        hitType: PropTypes.string
    }),
    /**
     * Enable adding/removing product as a favourite.
     * Use case: wishlist.
     */
    enableFavourite: PropTypes.bool,
    /**
     * Display the product as a favourite.
     */
    isFavourite: PropTypes.bool,
    /**
     * Callback function to be invoked when the user
     * interacts with favourite icon/button.
     */
    onFavouriteToggle: PropTypes.func,
    dynamicImageProps: PropTypes.object
}

export default ProductTile
