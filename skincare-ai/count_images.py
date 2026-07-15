import os

print(f"[DEBUG] Current working directory: {os.getcwd()}")

SKIN_TYPE_DIR = "datasets/skin-types/Oily-Dry-Skin-Types/train"
CONCERN_DIR = "datasets/facial-skin-acne-pigmentation/dataset"

print(f"[DEBUG] Checking path: {os.path.abspath(SKIN_TYPE_DIR)}")
print(f"[DEBUG] Does it exist? {os.path.isdir(SKIN_TYPE_DIR)}\n")

IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def count_images_per_class(base_dir):
    if not os.path.isdir(base_dir):
        print(f"  [!] Folder not found: {base_dir}")
        return

    class_folders = sorted(
        f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f))
    )

    if not class_folders:
        print(f"  [!] No subfolders found inside {base_dir}")
        return

    total = 0
    for class_name in class_folders:
        class_path = os.path.join(base_dir, class_name)
        count = sum(
            1 for f in os.listdir(class_path) if f.lower().endswith(IMAGE_EXTENSIONS)
        )
        total += count
        flag = "  <-- LOW, may need more images" if count < 100 else ""
        print(f"  {class_name:40s} {count:5d} images{flag}")

    print(f"  {'TOTAL':40s} {total:5d} images\n")


print("=" * 60)
print("SKIN TYPE dataset (train split)")
print("=" * 60)
count_images_per_class(SKIN_TYPE_DIR)

print("=" * 60)
print("SKIN CONCERN dataset")
print("=" * 60)
count_images_per_class(CONCERN_DIR)