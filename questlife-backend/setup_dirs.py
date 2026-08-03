import os

def create_dirs():
    base_dir = r"c:\Users\Himanshu\Desktop\CLASS\QLife\questlife-backend"
    os.makedirs(os.path.join(base_dir, "app", "engine"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "tests"), exist_ok=True)

if __name__ == "__main__":
    create_dirs()
