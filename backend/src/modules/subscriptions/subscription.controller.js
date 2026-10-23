
// // backend/src/modules/subscriptions/subscription.controller.js

// import User from "../../models/User.js";
// import UserSubscription from "./subscription.model.js";
// import Charity from "../charities/charity.model.js";
// import ApiError from "../../utils/ApiError.js";
// import { getStripe } from "../../config/stripe.js";
// import {
//   recordPaidInvoiceContribution,
// } from "./contribution.service.js";

// const getPriceId = (plan) => {
//   if (plan === "monthly") {
//     return process.env.STRIPE_PRICE_MONTHLY;
//   }

//   if (plan === "yearly") {
//     return process.env.STRIPE_PRICE_YEARLY;
//   }

//   return null;
// };

// const getStripeId = (value) => {
//   if (typeof value === "string") return value;
//   return value?.id ?? null;
// };

// const syncSubscription = async (stripeSubscription) => {
//   const stripe = getStripe();

//   const customerId = getStripeId(
//     stripeSubscription.customer
//   );

//   const priceId =
//     stripeSubscription.items?.data?.[0]?.price?.id ?? null;

//   const metadata = stripeSubscription.metadata ?? {};

//   const plan =
//     metadata.plan ??
//     (priceId === process.env.STRIPE_PRICE_YEARLY
//       ? "yearly"
//       : "monthly");

//   const update = {
//     user: metadata.userId,
//     plan,
//     stripeCustomerId: customerId,
//     stripeSubscriptionId: stripeSubscription.id,
//     stripePriceId: priceId,
//     status: stripeSubscription.status,
//     currentPeriodStart: stripeSubscription.current_period_start
//       ? new Date(stripeSubscription.current_period_start * 1000)
//       : stripeSubscription.items?.data?.[0]?.current_period_start
//         ? new Date(
//             stripeSubscription.items.data[0].current_period_start * 1000
//           )
//         : null,
//     currentPeriodEnd: stripeSubscription.current_period_end
//       ? new Date(stripeSubscription.current_period_end * 1000)
//       : stripeSubscription.items?.data?.[0]?.current_period_end
//         ? new Date(
//             stripeSubscription.items.data[0].current_period_end * 1000
//           )
//         : null,
//     cancelAtPeriodEnd:
//       Boolean(stripeSubscription.cancel_at_period_end),
//   };

//   if (!update.user) {
//     const existing = await UserSubscription.findOne({
//       stripeSubscriptionId: stripeSubscription.id,
//     });

//     if (!existing) {
//       throw new ApiError(
//         400,
//         "Subscription metadata is missing userId"
//       );
//     }

//     update.user = existing.user;
//   }

//   if (metadata.selectedCharity) {
//     update.selectedCharity = metadata.selectedCharity;
//   }

//   if (metadata.charityPercentage !== undefined) {
//     const percentage = Number(metadata.charityPercentage);

//     if (
//       Number.isFinite(percentage) &&
//       percentage >= 10 &&
//       percentage <= 100
//     ) {
//       update.charityPercentage = percentage;
//     }
//   }

//   const subscription = await UserSubscription.findOneAndUpdate(
//     { stripeSubscriptionId: stripeSubscription.id },
//     { $set: update },
//     {
//       new: true,
//       upsert: true,
//       runValidators: true,
//       setDefaultsOnInsert: true,
//     }
//   );

//   if (customerId) {
//     await User.findByIdAndUpdate(subscription.user, {
//       stripeCustomerId: customerId,
//     });
//   }

//   return subscription;
// };

// export const createCheckout = async (req, res, next) => {
//   try {
//     const stripe = getStripe();
//     const { plan } = req.body;

//     const user = await User.findById(req.user._id);

//     if (!user || !user.isActive) {
//       throw new ApiError(404, "User not found or inactive");
//     }

//     const existingSubscription = await UserSubscription.findOne({
//       user: user._id,
//       status: { $in: ["active", "trialing"] },
//     });

//     if (existingSubscription) {
//       throw new ApiError(
//         409,
//         "You already have an active subscription"
//       );
//     }

//     // if (!user.selectedCharity) {
//     //   throw new ApiError(
//     //     400,
//     //     "Please select a charity before subscribing"
//     //   );
//     // }

//     // const charity = await Charity.findOne({
//     //   _id: user.selectedCharity,
//     //   isActive: true,
//     // });
    
// const { selectedCharity, charityPercentage } = req.body;

// if (!selectedCharity) {
//   throw new ApiError(
//     400,
//     "Please select a charity before subscribing"
//   );
// }

// const charity = await Charity.findOne({
//   _id: selectedCharity,
//   isActive: true,
// });

// if (!charity) {
//   throw new ApiError(
//     400,
//     "Selected charity is unavailable"
//   );
// }


//     if (!charity) {
//       throw new ApiError(
//         400,
//         "Selected charity is unavailable"
//       );
//     }

//     // const charityPercentage = Number(
//     //   user.charityPercentage ?? 10
//     // );
//     const contributionPercentage = Number(
//   charityPercentage ?? 10
// );

// if (
//   !Number.isFinite(contributionPercentage) ||
//   contributionPercentage < 10 ||
//   contributionPercentage > 100
// ) {
//   throw new ApiError(
//     400,
//     "Charity contribution must be between 10% and 100%"
//   );
// }

//     if (
//       !Number.isFinite(charityPercentage) ||
//       charityPercentage < 10 ||
//       charityPercentage > 100
//     ) {
//       throw new ApiError(
//         400,
//         "Charity contribution must be between 10% and 100%"
//       );
//     }

//     const priceId = getPriceId(plan);

//     if (!priceId) {
//       throw new ApiError(
//         500,
//         `Stripe price ID is not configured for ${plan}`
//       );
//     }

//     const frontendUrl =
//       process.env.FRONTEND_URL || "http://localhost:5173";

//     const metadata = {
//       userId: user._id.toString(),
//       plan,
//       selectedCharity: charity._id.toString(),
//       charityPercentage: String(charityPercentage),
//     };

//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       customer: user.stripeCustomerId || undefined,
//       customer_email: user.stripeCustomerId
//         ? undefined
//         : user.email,
//       client_reference_id: user._id.toString(),
//       metadata,
//       subscription_data: {
//         metadata,
//       },
//       success_url:
//         `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${frontendUrl}/subscription/cancel`,
//     });

//     await UserSubscription.findOneAndUpdate(
//       { checkoutSessionId: session.id },
//       {
//         $set: {
//           user: user._id,
//           plan,
//           stripeCustomerId: user.stripeCustomerId || null,
//           checkoutSessionId: session.id,
//           stripePriceId: priceId,
//           selectedCharity: charity._id,
//           charityPercentage,
//           status: "incomplete",
//         },
//       },
//       {
//         new: true,
//         upsert: true,
//         runValidators: true,
//         setDefaultsOnInsert: true,
//       }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Checkout session created",
//       data: {
//         sessionId: session.id,
//         url: session.url,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getMySubscription = async (req, res, next) => {
//   try {
//     const subscription = await UserSubscription.findOne({
//       user: req.user._id,
//     })
//       .sort({ createdAt: -1 })
//       .populate("selectedCharity", "name slug");

//     res.status(200).json({
//       success: true,
//       data: subscription,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const cancelSubscription = async (req, res, next) => {
//   try {
//     const stripe = getStripe();

//     const subscription = await UserSubscription.findOne({
//       user: req.user._id,
//       status: { $in: ["active", "trialing", "past_due"] },
//     }).sort({ createdAt: -1 });

//     if (!subscription || !subscription.stripeSubscriptionId) {
//       throw new ApiError(404, "Active subscription not found");
//     }

//     const updatedStripeSubscription =
//       await stripe.subscriptions.update(
//         subscription.stripeSubscriptionId,
//         {
//           cancel_at_period_end: true,
//         }
//       );

//     const updatedSubscription = await syncSubscription(
//       updatedStripeSubscription
//     );

//     res.status(200).json({
//       success: true,
//       message: "Subscription will cancel at the end of the billing period",
//       data: updatedSubscription,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const stripeWebhook = async (req, res, next) => {
//   const stripe = getStripe();

//   let event;

//   try {
//     const signature = req.headers["stripe-signature"];
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     if (!webhookSecret) {
//       throw new ApiError(
//         500,
//         "Stripe webhook secret is not configured"
//       );
//     }

//     if (!signature) {
//       throw new ApiError(
//         400,
//         "Missing Stripe signature"
//       );
//     }

//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       webhookSecret
//     );
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: `Webhook signature verification failed: ${error.message}`,
//     });
//   }

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const session = event.data.object;

//         const subscriptionId = getStripeId(
//           session.subscription
//         );

//         if (!subscriptionId) break;

//         const stripeSubscription =
//           await stripe.subscriptions.retrieve(subscriptionId);

//         const customerId = getStripeId(
//           stripeSubscription.customer
//         );

//         // Link the checkout record before syncing. This prevents
//         // syncSubscription from creating a second record with the
//         // same unique Stripe subscription ID.
//         await UserSubscription.findOneAndUpdate(
//           { checkoutSessionId: session.id },
//           {
//             $set: {
//               stripeSubscriptionId: stripeSubscription.id,
//               stripeCustomerId: customerId,
//             },
//           },
//           { new: true }
//         );

//         await syncSubscription(stripeSubscription);
//         break;
//       }

//       case "customer.subscription.created":
//       case "customer.subscription.updated":
//       case "customer.subscription.deleted": {
//         await syncSubscription(event.data.object);
//         break;
//       }

//       case "invoice.paid": {
//         await recordPaidInvoiceContribution(event.data.object);
//         break;
//       }

//       default:
//         break;
//     }

//     res.status(200).json({
//       received: true,
//     });
//   } catch (error) {
//     // Returning a failure allows Stripe to retry the event.
//     next(error);
//   }
// };

// backend/src/modules/subscriptions/subscription.controller.js

import User from "../../models/User.js";
import UserSubscription from "./subscription.model.js";
import Charity from "../charities/charity.model.js";
import ApiError from "../../utils/ApiError.js";
import Contribution from "./contribution.model.js";
import { getStripe } from "../../config/stripe.js";
import {
  recordPaidInvoiceContribution,
} from "./contribution.service.js";

const getPriceId = (plan) => {
  if (plan === "monthly") {
    return process.env.STRIPE_PRICE_MONTHLY;
  }

  if (plan === "yearly") {
    return process.env.STRIPE_PRICE_YEARLY;
  }

  return null;
};

const getStripeId = (value) => {
  if (typeof value === "string") return value;
  return value?.id ?? null;
};

const syncSubscription = async (stripeSubscription) => {
  const customerId = getStripeId(
    stripeSubscription.customer
  );

  const priceId =
    stripeSubscription.items?.data?.[0]?.price?.id ?? null;

  const metadata = stripeSubscription.metadata ?? {};

  const plan =
    metadata.plan ??
    (priceId === process.env.STRIPE_PRICE_YEARLY
      ? "yearly"
      : "monthly");

  const update = {
    user: metadata.userId,
    plan,
    stripeCustomerId: customerId,
    stripeSubscriptionId: stripeSubscription.id,
    stripePriceId: priceId,
    status: stripeSubscription.status,
    currentPeriodStart: stripeSubscription.current_period_start
      ? new Date(
          stripeSubscription.current_period_start * 1000
        )
      : stripeSubscription.items?.data?.[0]?.current_period_start
        ? new Date(
            stripeSubscription.items.data[0].current_period_start * 1000
          )
        : null,
    currentPeriodEnd: stripeSubscription.current_period_end
      ? new Date(
          stripeSubscription.current_period_end * 1000
        )
      : stripeSubscription.items?.data?.[0]?.current_period_end
        ? new Date(
            stripeSubscription.items.data[0].current_period_end * 1000
          )
        : null,
    cancelAtPeriodEnd: Boolean(
      stripeSubscription.cancel_at_period_end
    ),
  };

  if (!update.user) {
    const existing = await UserSubscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (!existing) {
      throw new ApiError(
        400,
        "Subscription metadata is missing userId"
      );
    }

    update.user = existing.user;
  }

  if (metadata.selectedCharity) {
    update.selectedCharity = metadata.selectedCharity;
  }

  if (metadata.charityPercentage !== undefined) {
    const percentage = Number(
      metadata.charityPercentage
    );

    if (
      Number.isFinite(percentage) &&
      percentage >= 10 &&
      percentage <= 100
    ) {
      update.charityPercentage = percentage;
    }
  }

  const subscription = await UserSubscription.findOneAndUpdate(
    { stripeSubscriptionId: stripeSubscription.id },
    { $set: update },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  if (customerId) {
    await User.findByIdAndUpdate(subscription.user, {
      stripeCustomerId: customerId,
    });
  }

  return subscription;
};

export const createCheckout = async (req, res, next) => {
  try {
    const stripe = getStripe();

    const {
      plan,
      selectedCharity,
      charityPercentage,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !user.isActive) {
      throw new ApiError(
        404,
        "User not found or inactive"
      );
    }

    const existingSubscription = await UserSubscription.findOne({
      user: user._id,
      status: { $in: ["active", "trialing"] },
    });

    if (existingSubscription) {
      throw new ApiError(
        409,
        "You already have an active subscription"
      );
    }

    // Validate the selected charity.
    if (!selectedCharity) {
      throw new ApiError(
        400,
        "Please select a charity before subscribing"
      );
    }

    const charity = await Charity.findOne({
      _id: selectedCharity,
      isActive: true,
    });

    if (!charity) {
      throw new ApiError(
        400,
        "Selected charity is unavailable"
      );
    }

    // Validate the charity contribution percentage.
    const contributionPercentage = Number(
      charityPercentage ?? 10
    );

    if (
      !Number.isFinite(contributionPercentage) ||
      contributionPercentage < 10 ||
      contributionPercentage > 100
    ) {
      throw new ApiError(
        400,
        "Charity contribution must be between 10% and 100%"
      );
    }

    // Validate the subscription plan and Stripe price.
    const priceId = getPriceId(plan);

    if (!priceId) {
      throw new ApiError(
        400,
        "Invalid subscription plan. Choose monthly or yearly."
      );
    }

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    // Pass metadata to Stripe so the webhook can sync the
    // subscription and charity selection after checkout.
    const metadata = {
      userId: user._id.toString(),
      plan,
      selectedCharity: charity._id.toString(),
      charityPercentage: String(
        contributionPercentage
      ),
    };

    // Do not pass payment_method_types here.
    // Payment methods are managed in Stripe Dashboard settings.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId
        ? undefined
        : user.email,
      client_reference_id: user._id.toString(),
      metadata,
      subscription_data: {
        metadata,
      },
      success_url:
        `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        `${frontendUrl}/subscription/cancel`,
    });

    // Save the pending checkout in the database.
    await UserSubscription.findOneAndUpdate(
      { checkoutSessionId: session.id },
      {
        $set: {
          user: user._id,
          plan,
          stripeCustomerId: user.stripeCustomerId || null,
          checkoutSessionId: session.id,
          stripePriceId: priceId,
          selectedCharity: charity._id,
          charityPercentage: contributionPercentage,
          status: "incomplete",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Checkout session created",
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("selectedCharity", "name slug");

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    return next(error);
  }
};

// export const cancelSubscription = async (req, res, next) => {
//   try {
//     const stripe = getStripe();

//     const subscription = await UserSubscription.findOne({
//       user: req.user._id,
//       status: {
//         $in: ["active", "trialing", "past_due"],
//       },
//     }).sort({ createdAt: -1 });

//     if (
//       !subscription ||
//       !subscription.stripeSubscriptionId
//     ) {
//       throw new ApiError(
//         404,
//         "Active subscription not found"
//       );
//     }

//     const updatedStripeSubscription =
//       await stripe.subscriptions.update(
//         subscription.stripeSubscriptionId,
//         {
//           cancel_at_period_end: true,
//         }
//       );

//     const updatedSubscription = await syncSubscription(
//       updatedStripeSubscription
//     );

//     return res.status(200).json({
//       success: true,
//       message:
//         "Subscription will cancel at the end of the billing period",
//       data: updatedSubscription,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };


export const cancelSubscription = async (req, res, next) => {
  try {
    const stripe = getStripe();

    const subscription = await UserSubscription.findOne({
      user: req.user._id,
      status: {
        $in: ["active", "trialing", "past_due"],
      },
      stripeSubscriptionId: { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      throw new ApiError(404, "Active subscription not found");
    }

    // Retrieve the latest state directly from Stripe.
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    if (
      !["active", "trialing", "past_due"].includes(
        stripeSubscription.status
      )
    ) {
      throw new ApiError(
        400,
        "This subscription can no longer be cancelled."
      );
    }

    if (stripeSubscription.cancel_at_period_end) {
      return res.status(200).json({
        success: true,
        message:
          "Subscription is already scheduled to cancel at the end of the billing period.",
        data: subscription,
      });
    }

    // Schedule cancellation at the end of the current billing period.
    const updatedStripeSubscription =
      await stripe.subscriptions.update(
        stripeSubscription.id,
        {
          cancel_at_period_end: true,
        }
      );

    // Sync the confirmed Stripe state into MongoDB.
    const updatedSubscription = await syncSubscription(
      updatedStripeSubscription
    );

    return res.status(200).json({
      success: true,
      message:
        "Subscription will cancel at the end of the billing period.",
      data: updatedSubscription,
    });
  } catch (error) {
    return next(error);
  }
};

export const stripeWebhook = async (req, res, next) => {
  const stripe = getStripe();

  let event;

  try {
    const signature = req.headers["stripe-signature"];
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ApiError(
        500,
        "Stripe webhook secret is not configured"
      );
    }

    if (!signature) {
      throw new ApiError(
        400,
        "Missing Stripe signature"
      );
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        `Webhook signature verification failed: ${error.message}`,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const subscriptionId = getStripeId(
          session.subscription
        );

        if (!subscriptionId) break;

        const stripeSubscription =
          await stripe.subscriptions.retrieve(
            subscriptionId
          );

        const customerId = getStripeId(
          stripeSubscription.customer
        );

        

        // Link the pending checkout record before syncing
        // the Stripe subscription.
        await UserSubscription.findOneAndUpdate(
          { checkoutSessionId: session.id },
          {
            $set: {
              stripeSubscriptionId:
                stripeSubscription.id,
              stripeCustomerId: customerId,
            },
          },
          { new: true }
        );

        await syncSubscription(stripeSubscription);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object);
        break;
      }

      case "invoice.paid": {
        await recordPaidInvoiceContribution(
          event.data.object
        );
        break;
      }

      default:
        break;
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    return next(error);
  }
};
export const getMyContributions = async (req, res, next) => {
  try {
    const contributions = await Contribution.find({
      user: req.user._id,
    })
      .populate("charity", "name slug")
      .sort({ paidAt: -1, createdAt: -1 })
      .lean();

    const totalContribution = contributions.reduce(
      (total, contribution) =>
        contribution.status === "paid"
          ? total + contribution.contributionAmount
          : total,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        contributions,
        totalContribution,
        count: contributions.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};