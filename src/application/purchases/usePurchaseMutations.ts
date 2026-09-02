import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CancelPurchaseInput,
  CompletePurchaseInput,
  CreatePurchaseInput,
  Purchase,
  UpdatePurchaseInput,
} from "../../domain/purchases/Purchase";

import {
  purchaseService,
} from "../../services/purchases/purchaseService";

import {
  purchaseQueryKeys,
} from "./usePurchaseQuery";

function updatePurchaseCache(
  queryClient:
    ReturnType<
      typeof useQueryClient
    >,

  purchase:
    Purchase,
) {
  queryClient.setQueryData(
    purchaseQueryKeys.detail(
      purchase.id,
    ),

    purchase,
  );

  return queryClient.invalidateQueries({
    queryKey:
      purchaseQueryKeys.all,
  });
}

export function useCreatePurchaseMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CreatePurchaseInput,
    ) =>
      purchaseService.create(
        input,
      ),

    onSuccess: (
      purchase,
    ) =>
      updatePurchaseCache(
        queryClient,
        purchase,
      ),
  });
}

export function useUpdatePurchaseMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        UpdatePurchaseInput,
    ) =>
      purchaseService.update(
        input,
      ),

    onSuccess: (
      purchase,
    ) =>
      updatePurchaseCache(
        queryClient,
        purchase,
      ),
  });
}

export function useCompletePurchaseMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CompletePurchaseInput,
    ) =>
      purchaseService.complete(
        input,
      ),

    onSuccess: (
      purchase,
    ) =>
      updatePurchaseCache(
        queryClient,
        purchase,
      ),
  });
}

export function useCancelPurchaseMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CancelPurchaseInput,
    ) =>
      purchaseService.cancel(
        input,
      ),

    onSuccess: (
      purchase,
    ) =>
      updatePurchaseCache(
        queryClient,
        purchase,
      ),
  });
}