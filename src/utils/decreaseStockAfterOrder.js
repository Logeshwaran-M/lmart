import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

export const decreaseStockAfterOrder = async (items) => {
  await Promise.all(
    items.map(async (item) => {
      const productRef = doc(db, "products", item.id);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(productRef);
        if (!snap.exists()) {
          throw new Error("Product not found");
        }

        const data = snap.data();
        const variants = [...(data.variants || [])];

        const index = variants.findIndex(
          (v) => String(v.variantId) === String(item.variantId)
        );

        if (index === -1) {
          throw new Error("Variant not found");
        }

        if (variants[index].stock < item.quantity) {
          throw new Error("Insufficient stock");
        }

        variants[index].stock -= item.quantity;

        transaction.update(productRef, { variants });
      });
    })
  );
};
