const { ensureArray } = require('../utils')


const ALERT_LEVEL = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
}

const extend = async (cart) => {
  const cartItems = ensureArray(cart?.data)
  if (!cartItems.length) {
    return cart
  }

  // NOTE: this can be any custom identifier - it is used to ensure that if a cart is updated multiple times that it does not duplicate any of your custom modifications
  const itemMetadataIdentifier = 'EXAMPLE'

  cartItems[0] = {
    ...cartItems[0],
    // NOTE: example below on how to override custom vendor info into Cart Item "info bubble" (left side)
    meta: {
      ...cartItems[0].meta,
      vendor: 'Example Vendor',
    },
    relationships: {
      ...cartItems[0].relationships,
      metadata: [
        ...ensureArray(cartItems[0].relationships?.metadata).filter((_metadata) => (
           _metadata?.identifier !== itemMetadataIdentifier
        )),
        {
          identifier: itemMetadataIdentifier,
          data: [
            // NOTE: example below on how to add tags into Cart Item "info bubble" (left side)
            {
              type: 'data_tags',
              hide_identifier: true,
              value: 'EXAMPLE',
            },
            // NOTE: example below on how to add alerts into Cart Item (right side)
            {
              type: 'data_callouts',
              value: {
                alerts: [{
                  severity: ALERT_LEVEL.INFO,
                  description: 'This is an example item alert',
                }],
                // NOTE: can also be used same as alerts above but to display as notes instead of alerts on Cart Item
                notes: [],
              },
            }
          ],
        },
      ],
    },
  }

  // NOTE: example below on how to add notifications onto Cart (top of screen)
  const cartNotifications = [{
    severity: ALERT_LEVEL.CRITICAL,
    name: 'Important',
    description: 'This is an example cart alert.',
  }]

  const alerts = !cartNotifications.length
    ? cart.statuses?.alerts
    : cartNotifications.reduce((_alerts, notification) => {
      if (_alerts.some((_alert) => _alert?.name === notification.name)) {
        return _alerts
      }

      _alerts.push(notification)
      return _alerts
    }, ensureArray(cart.statuses?.alerts))

  return {
    ...cart,
    data: processedCartItems,
    ...alerts?.length && {
      statuses: {
        ...cart.statuses,
        alerts,
      },
    },
  }
}

module.exports = extend
