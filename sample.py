"""Sample file: a few basic bit manipulation exercises."""


def is_power_of_two(n: int) -> bool:
    """True if n is a positive power of two."""
    return n > 0 and (n & (n - 1)) == 0


def count_set_bits(n: int) -> int:
    """Count the 1 bits in a non-negative integer."""
    count = 0
    while n:
        n &= n - 1  # clear the lowest set bit
        count += 1
    return count


def get_bit(n: int, i: int) -> int:
    """Return bit i of n (0 or 1)."""
    return (n >> i) & 1


def set_bit(n: int, i: int) -> int:
    """Return n with bit i set to 1."""
    return n | (1 << i)


def clear_bit(n: int, i: int) -> int:
    """Return n with bit i set to 0."""
    return n & ~(1 << i)


def toggle_bit(n: int, i: int) -> int:
    """Return n with bit i flipped."""
    return n ^ (1 << i)


if __name__ == "__main__":
    x = 0b1011  # 11
    print(f"x = {x} ({x:04b})")
    print("is_power_of_two(16):", is_power_of_two(16))
    print("count_set_bits(x):  ", count_set_bits(x))
    print("get_bit(x, 2):      ", get_bit(x, 2))
    print("set_bit(x, 2):      ", f"{set_bit(x, 2):04b}")
    print("clear_bit(x, 0):    ", f"{clear_bit(x, 0):04b}")
    print("toggle_bit(x, 3):   ", f"{toggle_bit(x, 3):04b}")
